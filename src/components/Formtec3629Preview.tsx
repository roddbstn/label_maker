"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import { useLabelStore } from "@/store/labelStore";
import { FORMTEC_3629_COORDS } from "@/types";

/**
 * mm를 미리보기 픽셀로 변환
 */
function mmToPx(mm: number, scale: number): number {
    return mm * scale;
}

/**
 * HTML에서 순수 텍스트 추출
 */
function htmlToPlainText(html: string): string {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .trim();
}

/**
 * HTML에서 구조 태그만 제거, font-size span은 유지 (측면 렌더링용)
 */
function htmlToPlainTextKeepSpans(html: string): string {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<div[^>]*>/gi, " ")
        .replace(/<\/div>/gi, "")
        .replace(/<p[^>]*>/gi, " ")
        .replace(/<\/p>/gi, "")
        .trim();
}

/**
 * HTML을 미리보기용으로 정규화 및 스케일 조정
 * - pt 단위 스타일 추출 및 스케일 적용
 * - 36pt(중간), 24pt(작게)를 상대적 크기로 변환
 */
function normalizeHtmlForPreview(
    html: string,
    scale: number,
    autoFontSize: number,
    mediumScale: number = 0.8,
    smallScale: number = 0.6
): string {
    if (!html) return "";

    let processedHtml = html;

    // 36pt -> 중간 배율 (0.8x)
    // 24pt -> 작게 배율 (0.6x)
    processedHtml = processedHtml.replace(/font-size:\s*(\d+(\.\d+)?)pt/gi, (match, p1) => {
        const pt = parseFloat(p1);
        let finalPx: number;

        if (pt === 36) {
            // 중간 (0.8배)
            finalPx = Math.max(8, autoFontSize * mediumScale);
        } else if (pt === 24) {
            // 작게 (0.6배)
            finalPx = Math.max(6, autoFontSize * smallScale);
        } else {
            // 기타 커스텀 pt
            const ptToMm = 0.3528;
            finalPx = pt * ptToMm * scale;
        }
        return `font-size: ${finalPx}px`;
    });

    return processedHtml
        .replace(/<div[^>]*>/gi, "<br>")
        .replace(/<\/div>/gi, "")
        .replace(/(<br\s*\/?>\s*)+/gi, "<br>")
        .replace(/^<br\s*\/?>/gi, "")
        .replace(/\n/g, "<br>");
}

/**
 * HTML에서 글꼴 추출 (font-family 스타일)
 */
function extractFontFamily(html: string): string | undefined {
    if (!html) return undefined;

    // font-family 스타일 추출
    const fontFamilyMatch = html.match(/font-family:\s*([^;"']+)/i);
    if (fontFamilyMatch) {
        return fontFamilyMatch[1].trim();
    }

    // <font face="..."> 태그 추출
    const fontFaceMatch = html.match(/<font[^>]*face=["']([^"']+)["']/i);
    if (fontFaceMatch) {
        return fontFaceMatch[1].trim();
    }

    return undefined;
}

/**
 * HTML에서 Bold 여부 추출
 */
function extractIsBold(html: string): boolean {
    if (!html) return false;

    // <b> 또는 <strong> 태그가 있는지
    if (/<b>|<b\s|<strong>|<strong\s/i.test(html)) {
        return true;
    }

    // font-weight: bold 스타일이 있는지
    if (/font-weight:\s*(bold|700|800|900)/i.test(html)) {
        return true;
    }

    return false;
}

interface AutoFitTextProps {
    text: string;
    containerWidth: number;
    containerHeight: number;
    baseSize: number;
    minSize?: number;
    isVertical?: boolean;
    isHtml?: boolean;
    className?: string;
    fallback?: string;
    fixedSize?: number; // HWP/Word 기준 pt 단위
    isBold?: boolean;
    lineHeight?: number;
    scale: number;
    mediumScale?: number;
    smallScale?: number;
}

/**
 * 자동 크기 조절 텍스트 컴포넌트
 * 컨테이너에 맞게 폰트 크기를 자동으로 조정하거나 고정 크기 적용
 */
function AutoFitText({
    text,
    containerWidth,
    containerHeight,
    baseSize,
    minSize = 4,
    isVertical = false,
    isHtml = false,
    className = "",
    fallback = "",
    fixedSize,
    isBold = false,
    lineHeight,
    scale,
    mediumScale = 0.8,
    smallScale = 0.6,
}: AutoFitTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(baseSize);

    const displayText = text || fallback;
    const normalizedHtml = isHtml ? normalizeHtmlForPreview(text, scale, fontSize, mediumScale, smallScale) : "";

    // pt 단위를 미리보기 픽셀(px)로 변환 로직
    // 1pt = 0.3528mm. 여기에 이미 계산된 scale을 곱해줌.
    // 하지만 fixedSize는 mm로 바로 변환해서 baseSize 자리에 넣어주는게 더 정확함.

    useLayoutEffect(() => {
        if (!containerRef.current || !displayText) {
            setFontSize(baseSize); // baseSize is already in px
            return;
        }

        const container = containerRef.current;
        const textEl = container.querySelector('[data-text]') as HTMLElement;
        if (!textEl) return;

        // 고정 크기(pt)가 있을 때: pt -> mm -> px 변환
        if (fixedSize && fixedSize > 0) {
            const ptToMm = 0.3528;
            const targetPx = fixedSize * ptToMm * scale;
            setFontSize(targetPx);
            return;
        }

        // --- 기존 자동 크기 조절 로직 (px 단위) ---
        const padding = 8;
        const maxWidth = containerWidth - padding * 2;
        const maxHeight = containerHeight - padding * 2;
        const maxFontSize = Math.min(containerHeight * 0.4, containerWidth * 0.3, baseSize * 1.2);
        let size = maxFontSize;

        // 측정용 임시 스타일 적용 (크기 제한 해제)
        textEl.style.width = "auto";
        textEl.style.height = "auto";
        textEl.style.display = "inline-block";

        // 큰 크기에서 시작해서 맞을 때까지 줄이기
        for (let i = 0; i < 100 && size > minSize; i++) {
            textEl.style.fontSize = `${size}px`;

            const textWidth = textEl.scrollWidth;
            const textHeight = textEl.scrollHeight;

            if (textWidth <= maxWidth && textHeight <= maxHeight) {
                break;
            }
            size -= 0.5;
        }

        // 스타일 복구
        textEl.style.width = "";
        textEl.style.height = "";
        textEl.style.display = "";

        setFontSize(Math.max(size, minSize));
    }, [displayText, containerWidth, containerHeight, baseSize, minSize, fixedSize, scale]);

    if (!displayText && !fallback) {
        return null;
    }

    const textStyle: React.CSSProperties = {
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight || 1,
        textAlign: "center",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        fontWeight: isBold ? "bold" : "inherit",
        fontFamily: "'HamchoromDotum', 'Malgun Gothic', sans-serif",
        // html2canvas 보정용 추가 스타일
        verticalAlign: "middle",
    };

    if (!displayText && fallback) {
        return (
            <div
                ref={containerRef}
                className={`w-full h-full flex items-center justify-center ${className}`}
            >
                <span data-text className="text-gray-300 italic" style={textStyle}>
                    {fallback}
                </span>
            </div>
        );
    }

    if (isHtml && normalizedHtml) {
        return (
            <div
                ref={containerRef}
                className={`w-full h-full flex items-center justify-center overflow-hidden ${className}`}
            >
                <div
                    data-text
                    style={textStyle}
                    dangerouslySetInnerHTML={{ __html: normalizeHtmlForPreview(text, scale, fontSize, mediumScale, smallScale) }}
                />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex items-center justify-center overflow-hidden ${className}`}
        >
            <span data-text style={textStyle}>{displayText}</span>
        </div>
    );
}

interface LabelBoxProps {
    x: number;
    y: number;
    width: number;
    height: number;
    paddingX?: number;
    paddingY?: number;
    scale: number;
    pageHeight: number;
    children?: React.ReactNode;
    className?: string;
    isVertical?: boolean;
}

/**
 * 라벨 박스 컴포넌트
 * '스티커 칸' 내부에 '라벨 칸'을 패딩만큼 띄워서 배치
 */
function LabelBox({
    x,
    y,
    width,
    height,
    paddingX = 0,
    paddingY = 0,
    scale,
    pageHeight,
    children,
    className = "",
    isVertical = false,
}: LabelBoxProps) {
    // Y 좌표 변환: 좌하단 원점 → 좌상단 원점
    const topY = pageHeight - y - height;

    return (
        <div
            className={`absolute overflow-hidden ${className}`}
            style={{
                left: mmToPx(x, scale),
                top: mmToPx(topY, scale),
                width: mmToPx(width, scale),
                height: mmToPx(height, scale),
                boxSizing: 'border-box'
            }}
        >
            {/* 실제 라벨 영역 (패딩 적용) */}
            <div
                className="w-full h-full bg-white flex items-center justify-center text-xs text-gray-800"
                style={{
                    padding: `${mmToPx(paddingY, scale)}px ${mmToPx(paddingX, scale)}px`,
                    boxSizing: 'border-box',
                    writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
                }}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * pt 단위 사용자 폰트 크기를 스케일 팩터로 변환
 * Auto(0/undefined) → 1.0, 중간(36) → 0.75, 작게(24) → 0.55
 */
function fontSizeScaleFactor(ptSize?: number): number {
    if (!ptSize || ptSize === 0) return 1.0;
    if (ptSize >= 36) return 0.75;
    if (ptSize >= 24) return 0.55;
    return 1.0;
}

/**
 * HTML에서 글자별 폰트 크기 정보를 추출
 * <span style="font-size:24pt">작은</span>큰글자 → [{char:'작',fontSizePt:24},{char:'은',fontSizePt:24},{char:'큰'},{char:'글'},{char:'자'}]
 */
function parseHtmlToCharsWithSize(html: string): { char: string; fontSizePt?: number }[] {
    if (!html) return [];

    // 임시 DOM으로 파싱
    const div = document.createElement('div');
    div.innerHTML = html;

    const result: { char: string; fontSizePt?: number }[] = [];

    function walk(node: Node, inheritedSize?: number) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            for (const char of text) {
                if (char === '\n') continue; // 줄바꿈 문자 스킵 (br로 처리)
                result.push({ char, fontSizePt: inheritedSize });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tagName = el.tagName.toLowerCase();

            // <br> → 공백으로 처리 (옆면에서 세로 간격)
            if (tagName === 'br') {
                return;
            }

            // font-size 스타일 추출
            let fontSize = inheritedSize;
            const style = el.getAttribute('style');
            if (style) {
                const match = style.match(/font-size:\s*([\d.]+)pt/i);
                if (match) fontSize = parseFloat(match[1]);
            }

            for (let i = 0; i < el.childNodes.length; i++) {
                walk(el.childNodes[i], fontSize);
            }
        }
    }

    walk(div);
    return result;
}

/**
 * 측면 분류번호 라벨 (93×28mm)
 */
function SideClassLabel({
    x,
    y,
    width,
    height,
    paddingX = 0,
    paddingY = 0,
    scale,
    pageHeight,
    classificationCode,
    productionYear,
    retentionPeriod,
    title,
    fontFamily,
    titleIsBold,
    productionYearIsBold,
    titleFontSize,
}: {
    x: number;
    y: number;
    width: number;
    height: number;
    paddingX?: number;
    paddingY?: number;
    scale: number;
    pageHeight: number;
    classificationCode: string;
    productionYear: string;
    retentionPeriod: string;
    title: string;
    fontFamily?: string;
    titleIsBold?: boolean;
    productionYearIsBold?: boolean;
    titleFontSize?: number; // pt 단위
}) {
    // 라벨 크기는 스티커 크기에서 패딩을 뺀 크기
    const labelWidth = width - paddingX * 2;
    const labelHeight = height - paddingY * 2;

    // 스티커 기준 topY 계산
    const stickerTopY = pageHeight - y - height;
    // 라벨 기준 topY 계산 (스티커 내부에서 paddingY만큼 내려옴)
    const labelTopY = stickerTopY + paddingY;
    const labelLeft = x + paddingX;

    return (
        <div
            className="absolute bg-white overflow-hidden"
            style={{
                left: mmToPx(labelLeft, scale),
                top: mmToPx(labelTopY, scale),
                width: mmToPx(labelWidth, scale),
                height: mmToPx(labelHeight, scale),
                border: `${mmToPx(0.1, scale)}px solid #000000`,
                boxSizing: 'border-box'
            }}
        >
            <table
                style={{
                    width: '100%',
                    height: '100%',
                    borderCollapse: 'collapse',
                    borderSpacing: 0,
                    tableLayout: 'fixed'
                }}
            >
                <tbody>
                    <tr style={{ height: '50%' }}>
                        {[
                            { text: "분류\n번호", isLabel: true },
                            { text: classificationCode || "", isLabel: false },
                            { text: "생산\n연도", isLabel: true },
                            { text: (productionYear || "").replace(/[^0-9]/g, ""), isLabel: false },
                            { text: "보존\n기간", isLabel: true },
                            { text: retentionPeriod || "", isLabel: false }
                        ].map((item, i) => (
                            <td
                                key={i}
                                style={{
                                    borderRight: i < 5 ? `${mmToPx(0.1, scale)}px solid #000000` : "none",
                                    borderBottom: `${mmToPx(0.1, scale)}px solid #000000`,
                                    padding: 0,
                                    width: '16.666%',
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                    fontSize: item.isLabel ? mmToPx(3.2, scale) : mmToPx(3.6, scale),
                                    fontFamily: "'HamchoromDotum', 'Malgun Gothic', sans-serif",
                                    fontWeight: 'bold',
                                    color: '#1f2937',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <div style={{
                                    whiteSpace: item.isLabel ? 'pre-line' : 'nowrap',
                                    lineHeight: 1.1,
                                }}>
                                    {item.text}
                                </div>
                            </td>
                        ))}
                    </tr>
                    <tr style={{ height: '50%' }}>
                        <td
                            style={{
                                width: mmToPx(20.5, scale),
                                borderRight: `${mmToPx(0.1, scale)}px solid #000000`,
                                padding: 0,
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                color: '#1f2937',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    width: mmToPx(10, scale),
                                    lineHeight: 1.1,
                                    fontSize: mmToPx(3.2, scale),
                                    fontWeight: 'bold',
                                    fontFamily: "'HamchoromDotum', 'Malgun Gothic', sans-serif",
                                }}>
                                    <span>제</span>
                                    <span>목</span>
                                </div>
                                <div style={{
                                    fontSize: mmToPx(3.0, scale),
                                    lineHeight: 1.1,
                                    fontWeight: 'bold',
                                    fontFamily: "'HamchoromDotum', 'Malgun Gothic', sans-serif",
                                    whiteSpace: 'nowrap',
                                }}>
                                    (보존종료)
                                </div>
                            </div>
                        </td>
                        <td
                            colSpan={5}
                            style={{
                                padding: `0 ${mmToPx(2, scale)}px`,
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                color: '#1f2937',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div style={{
                                width: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: mmToPx(4.3, scale) * fontSizeScaleFactor(titleFontSize),
                                fontFamily: "'Pretendard Variable', sans-serif",
                                fontWeight: 900,
                            }}>
                                {(() => {
                                    const baseFontPx = mmToPx(4.3, scale) * fontSizeScaleFactor(titleFontSize);
                                    const charsWithSize = parseHtmlToCharsWithSize(title);
                                    if (charsWithSize.length === 0) return "제목을 입력하세요";
                                    return charsWithSize.map((item, idx) => {
                                        const charScale = item.fontSizePt ? fontSizeScaleFactor(item.fontSizePt) : 1.0;
                                        return (
                                            <span key={idx} style={{ fontSize: baseFontPx * charScale }}>
                                                {item.char}
                                            </span>
                                        );
                                    });
                                })()}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

/**
 * 옆면 분류번호 라벨 (16×256mm, 세로)
 */
function EdgeClassLabel({
    x,
    y,
    width,
    height,
    paddingX = 0,
    paddingY = 0,
    scale,
    pageHeight,
    managementNumber,
    productionYear,
    retentionPeriod,
    classificationCode,
    title,
    departmentName,
    fontSize,
    fontFamily,
    isBold,
    titleFontSize,
    departmentNameFontSize,
    hideDepartmentOnEdge,
}: {
    x: number;
    y: number;
    width: number;
    height: number;
    paddingX?: number;
    paddingY?: number;
    scale: number;
    pageHeight: number;
    managementNumber: string;
    productionYear: string;
    retentionPeriod: string;
    classificationCode: string;
    title: string;
    departmentName: string;
    fontSize?: number;
    fontFamily?: string;
    isBold?: boolean;
    titleFontSize?: number;
    departmentNameFontSize?: number;
    hideDepartmentOnEdge?: boolean;
}) {
    const labelWidth = width - paddingX * 2;
    const labelHeight = height - paddingY * 2;

    // 스티커 기준 topY 계산
    const stickerTopY = pageHeight - y - height;
    // 라벨 기준 topY 계산
    const labelTopY = stickerTopY + paddingY;
    const labelLeft = x + paddingX;

    // 기본 폰트 크기 상향 (3.2 -> 3.6)
    const effectiveFontSize = fontSize || 3.6;

    // 부서명에서 줄바꿈을 공백으로 대체 (옆면은 항상 1열로 표시)
    const deptNameForEdge = htmlToPlainText(departmentName).replace(/\n/g, ' ');

    // 생산연도에서 숫자만 추출
    const yearOnly = htmlToPlainText(productionYear).replace(/[^0-9]/g, '');

    const values = [
        "", managementNumber, "", yearOnly, "", retentionPeriod,
        "", classificationCode, "", htmlToPlainText(title), "", deptNameForEdge,
    ];

    // 제목과 부서명 인덱스 (values 배열에서)
    const titleIndex = 9;
    const deptIndex = 11;

    // Conditionally adjust rows based on hideDepartmentOnEdge
    const baseRows = FORMTEC_3629_COORDS.edgeInternal.rows;
    const adjustedRows = hideDepartmentOnEdge
        ? baseRows.map((row, i) => {
            // Expand title value row (index 9): 104mm + 6mm (dept label) + 74mm (dept value) = 184mm
            if (i === 9) {
                return { ...row, height: 184.0 };
            }
            return row;
        }).filter((row, i) =>
            // Remove department label (index 10) and department value (index 11)
            i !== 10 && i !== 11
        )
        : baseRows;

    let currentY = paddingY;

    return (
        <div
            className="absolute bg-white overflow-hidden"
            style={{
                left: mmToPx(labelLeft, scale),
                top: mmToPx(labelTopY, scale),
                width: mmToPx(labelWidth, scale),
                height: mmToPx(labelHeight, scale),
                border: `${mmToPx(0.1, scale)}px solid #000000`,
                boxSizing: 'border-box'
            }}
        >
            <table
                style={{
                    width: '100%',
                    height: '100%',
                    borderCollapse: 'collapse',
                    borderSpacing: 0,
                    tableLayout: 'fixed'
                }}
            >
                <tbody>
                    {adjustedRows.map((row, i) => {
                        const isLabel = row.label !== "value";
                        let displayText = isLabel ? row.label : values[i] || "";

                        // 라벨에 줄바꿈 추가
                        if (isLabel && displayText) {
                            switch (displayText) {
                                case "관리번호":
                                    displayText = "관리번호";
                                    break;
                                case "생산연도":
                                    displayText = "생산연도";
                                    break;
                                case "보존기간":
                                    displayText = "보존기간";
                                    break;
                                case "분류번호":
                                    displayText = "분류번호";
                                    break;
                                case "제목":
                                    displayText = "제   목";
                                    break;
                                case "부 서 명":
                                    displayText = "부 서 명";
                                    break;
                            }
                        }

                        // 세로 텍스트가 필요한 영역 (높이가 20mm 이상)
                        const needsVertical = row.height > 20;
                        const isTitleOrDept = i === titleIndex || i === deptIndex;
                        const rowHeightPx = mmToPx(row.height, scale);
                        const isLast = i === adjustedRows.length - 1;

                        const currentFontSizePx = isLabel ? mmToPx(2.45, scale) : (
                            isTitleOrDept
                                ? mmToPx(9.5, scale)
                                : mmToPx(effectiveFontSize - 0.35, scale)
                        );

                        // 사용자 지정 폰트 크기 스케일 적용
                        const userFontScale = (i === titleIndex)
                            ? fontSizeScaleFactor(titleFontSize)
                            : (i === deptIndex)
                                ? fontSizeScaleFactor(departmentNameFontSize)
                                : 1.0;

                        return (
                            <tr key={i} style={{ height: rowHeightPx }}>
                                <td
                                    style={{
                                        borderBottom: !isLast ? `${mmToPx(0.1, scale)}px solid #000000` : "none",
                                        padding: 0,
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        fontSize: currentFontSizePx,
                                        fontFamily: "'HamchoromDotum', 'Malgun Gothic', sans-serif",
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        boxSizing: 'border-box',
                                        height: rowHeightPx
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            width: '100%',
                                        }}
                                    >
                                        {needsVertical ? (
                                            isTitleOrDept ? (
                                                (() => {
                                                    const cellHeightPx = rowHeightPx;
                                                    const cellWidthPx = mmToPx(labelWidth, scale);
                                                    const verticalPadding = mmToPx(3, scale);
                                                    const horizontalPadding = mmToPx(2, scale);
                                                    const availableHeightPx = cellHeightPx - verticalPadding;
                                                    const availableWidthPx = cellWidthPx - horizontalPadding;
                                                    const textLength = displayText.length;
                                                    const charHeightPx = availableHeightPx / Math.max(textLength, 1);

                                                    let fontSizePx = charHeightPx * 0.98;
                                                    fontSizePx = Math.min(fontSizePx, availableWidthPx * 0.85);
                                                    fontSizePx = Math.min(fontSizePx, mmToPx(5.2, scale));
                                                    fontSizePx = Math.max(fontSizePx, mmToPx(1.5, scale));
                                                    fontSizePx *= userFontScale;

                                                    return (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                width: "100%",
                                                                height: "100%",
                                                                padding: `${verticalPadding / 2}px ${horizontalPadding / 2}px`,
                                                                boxSizing: "border-box",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: fontSizePx,
                                                                    lineHeight: 1,
                                                                }}
                                                            >
                                                                {(() => {
                                                                    const rawHtml = i === titleIndex ? title : departmentName;
                                                                    const charsWithSize = parseHtmlToCharsWithSize(rawHtml);

                                                                    return charsWithSize.map((item, idx) => {
                                                                        const isParenthesis = item.char === '(' || item.char === ')';
                                                                        const isSpace = item.char === ' ';
                                                                        const charScale = item.fontSizePt ? fontSizeScaleFactor(item.fontSizePt) : 1.0;
                                                                        const charFontSize = fontSizePx * charScale;

                                                                        if (isSpace) {
                                                                            return <span key={idx} style={{ display: "block", height: charFontSize * 0.5 }}>&nbsp;</span>;
                                                                        }

                                                                        if (isParenthesis) {
                                                                            return <span key={idx} style={{ display: "inline-block", transform: "rotate(90deg)", lineHeight: 1, fontSize: charFontSize }}>{item.char}</span>;
                                                                        }

                                                                        return <span key={idx} style={{ lineHeight: 1, fontSize: charFontSize }}>{item.char}</span>;
                                                                    });
                                                                })()}
                                                            </div>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <div style={{
                                                    writingMode: 'vertical-rl',
                                                    textOrientation: 'upright',
                                                    lineHeight: 1.1,
                                                    letterSpacing: mmToPx(1.5, scale)
                                                }}>
                                                    {displayText}
                                                </div>
                                            )
                                        ) : (
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                {displayText}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

interface Formtec3629PreviewProps {
    /** 현재 페이지 (0-indexed) */
    currentPage?: number;
}

/**
 * 폼텍 3629 양식 전체 미리보기
 * A4 용지에 2세트의 커버 라벨 + 2개의 옆면 라벨 표시
 */
export default function Formtec3629Preview({ currentPage = 0 }: Formtec3629PreviewProps) {
    const { labels } = useLabelStore();
    const coords = FORMTEC_3629_COORDS;

    // 미리보기 스케일 (A4 너비를 기준) - 가로 길이를 상향하여 폼과 균형 맞춤
    const previewWidth = 480;
    const scale = previewWidth / coords.page.width;
    const previewHeight = coords.page.height * scale;

    // 현재 페이지에 표시할 라벨 인덱스 (2개씩)
    const startIndex = currentPage * 2;
    const label1 = labels[startIndex];
    const label2 = labels[startIndex + 1];

    // 총 페이지 수
    const totalPages = Math.ceil(labels.length / 2);

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600 mb-2">
                📄 폼텍 3629 양식 미리보기
                {totalPages > 1 && (
                    <span className="ml-2 text-gray-400">
                        (페이지 {currentPage + 1}/{totalPages})
                    </span>
                )}
            </p>

            {/* A4 용지 미리보기 */}
            <div
                id="formtec-3629-preview"
                className="relative mx-auto bg-white shadow-xl overflow-hidden"
                style={{
                    width: previewWidth,
                    height: previewHeight,
                    border: "0.5mm solid #000000",
                    boxSizing: 'border-box',
                }}
            >
                {/* 라벨 세트 1 (상단) */}
                {label1 && (
                    <>
                        {/* 제목 라벨 */}
                        <LabelBox
                            x={coords.set1.title.x}
                            y={coords.set1.title.y}
                            width={coords.set1.title.width}
                            height={coords.set1.title.height}
                            paddingX={coords.set1.title.paddingX}
                            paddingY={coords.set1.title.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold text-center"
                        >
                            <AutoFitText
                                text={label1.title}
                                containerWidth={mmToPx(coords.set1.title.width - (coords.set1.title.paddingX || 0) * 2, scale)}
                                containerHeight={mmToPx(coords.set1.title.height - (coords.set1.title.paddingY || 0) * 2, scale)}
                                baseSize={mmToPx(10, scale)}
                                minSize={mmToPx(3, scale)}
                                isHtml={true}
                                fallback="제목"
                                fixedSize={label1.titleFontSize}
                                isBold={label1.titleIsBold}
                                scale={scale}
                            />
                        </LabelBox>

                        {/* 년도 라벨 */}
                        <LabelBox
                            x={coords.set1.year.x}
                            y={coords.set1.year.y}
                            width={coords.set1.year.width}
                            height={coords.set1.year.height}
                            paddingX={coords.set1.year.paddingX}
                            paddingY={coords.set1.year.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label1.productionYear}
                                containerWidth={mmToPx(coords.set1.year.width - (coords.set1.year.paddingX || 0) * 2, scale)}
                                containerHeight={mmToPx(coords.set1.year.height - (coords.set1.year.paddingY || 0) * 2, scale)}
                                baseSize={mmToPx(8, scale)}
                                minSize={mmToPx(2.5, scale)}
                                isHtml={true}
                                fallback="년도"
                                fixedSize={label1.productionYearFontSize}
                                isBold={label1.productionYearIsBold}
                                scale={scale}
                            />
                        </LabelBox>

                        {/* 부서명 라벨 */}
                        <LabelBox
                            x={coords.set1.department.x}
                            y={coords.set1.department.y}
                            width={coords.set1.department.width}
                            height={coords.set1.department.height}
                            paddingX={coords.set1.department.paddingX}
                            paddingY={coords.set1.department.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label1.departmentName}
                                containerWidth={mmToPx(coords.set1.department.width - (coords.set1.department.paddingX || 0) * 2, scale)}
                                containerHeight={mmToPx(coords.set1.department.height - (coords.set1.department.paddingY || 0) * 2, scale)}
                                baseSize={mmToPx(6, scale)}
                                minSize={mmToPx(2, scale)}
                                isHtml={true}
                                fallback="부서명"
                                fixedSize={label1.departmentNameFontSize}
                                isBold={label1.departmentNameIsBold}
                                lineHeight={1.6}
                                scale={scale}
                            />
                        </LabelBox>

                        {/* 측면 분류번호 라벨 */}
                        <SideClassLabel
                            x={coords.set1.sideClass.x}
                            y={coords.set1.sideClass.y}
                            width={coords.set1.sideClass.width}
                            height={coords.set1.sideClass.height}
                            paddingX={coords.set1.sideClass.paddingX}
                            paddingY={coords.set1.sideClass.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            classificationCode={label1.classificationCode}
                            productionYear={label1.productionYear}
                            retentionPeriod={label1.retentionPeriod}
                            title={label1.titleSide ?? label1.title}
                            fontFamily={label1.fontFamily}
                            titleIsBold={label1.titleIsBold}
                            productionYearIsBold={label1.productionYearIsBold}
                            titleFontSize={label1.titleFontSizeSide}
                        />

                        {/* 옆면 분류번호 라벨 1 */}
                        <EdgeClassLabel
                            x={coords.edge1.x}
                            y={coords.edge1.y}
                            width={coords.edge1.width}
                            height={coords.edge1.height}
                            paddingX={coords.edge1.paddingX}
                            paddingY={coords.edge1.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            managementNumber={label1.managementNumber}
                            productionYear={label1.productionYear}
                            retentionPeriod={label1.retentionPeriod}
                            classificationCode={label1.classificationCode}
                            title={label1.titleEdge ?? label1.title}
                            departmentName={label1.departmentNameEdge ?? label1.departmentName}
                            fontFamily={label1.fontFamily}
                            isBold={label1.titleIsBold}
                            titleFontSize={label1.titleFontSizeEdge}
                            departmentNameFontSize={label1.departmentNameFontSizeEdge}
                            hideDepartmentOnEdge={label1.hideDepartmentOnEdge}
                        />
                    </>
                )}

                {/* 라벨 세트 2 (하단) */}
                {label2 && (
                    <>
                        {/* 제목 라벨 */}
                        <LabelBox
                            x={coords.set2.title.x}
                            y={coords.set2.title.y}
                            width={coords.set2.title.width}
                            height={coords.set2.title.height}
                            paddingX={coords.set2.title.paddingX}
                            paddingY={coords.set2.title.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold text-center"
                        >
                            <AutoFitText
                                text={label2.title}
                                containerWidth={mmToPx(coords.set2.title.width - (coords.set2.title.paddingX || 0) * 2, scale)}
                                containerHeight={mmToPx(coords.set2.title.height - (coords.set2.title.paddingY || 0) * 2, scale)}
                                baseSize={mmToPx(10, scale)}
                                minSize={mmToPx(3, scale)}
                                isHtml={true}
                                fallback="제목"
                                fixedSize={label2.titleFontSize}
                                isBold={label2.titleIsBold}
                                scale={scale}
                            />
                        </LabelBox>

                        {/* 년도 라벨 */}
                        <LabelBox
                            x={coords.set2.year.x}
                            y={coords.set2.year.y}
                            width={coords.set2.year.width}
                            height={coords.set2.year.height}
                            paddingX={coords.set2.year.paddingX}
                            paddingY={coords.set2.year.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label2.productionYear}
                                containerWidth={mmToPx(coords.set2.year.width - (coords.set2.year.paddingX || 0) * 2, scale)}
                                containerHeight={mmToPx(coords.set2.year.height - (coords.set2.year.paddingY || 0) * 2, scale)}
                                baseSize={mmToPx(8, scale)}
                                minSize={mmToPx(2.5, scale)}
                                isHtml={true}
                                fallback="년도"
                                fixedSize={label2.productionYearFontSize}
                                isBold={label2.productionYearIsBold}
                                scale={scale}
                            />
                        </LabelBox>

                        {/* 부서명 라벨 */}
                        <LabelBox
                            x={coords.set2.department.x}
                            y={coords.set2.department.y}
                            width={coords.set2.department.width}
                            height={coords.set2.department.height}
                            paddingX={coords.set2.department.paddingX}
                            paddingY={coords.set2.department.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label2.departmentName}
                                containerWidth={mmToPx(coords.set2.department.width - (coords.set2.department.paddingX || 0) * 2, scale)}
                                containerHeight={mmToPx(coords.set2.department.height - (coords.set2.department.paddingY || 0) * 2, scale)}
                                baseSize={mmToPx(6, scale)}
                                minSize={mmToPx(2, scale)}
                                isHtml={true}
                                fallback="부서명"
                                fixedSize={label2.departmentNameFontSize}
                                isBold={label2.departmentNameIsBold}
                                lineHeight={1.6}
                                scale={scale}
                            />
                        </LabelBox>

                        {/* 측면 분류번호 라벨 */}
                        <SideClassLabel
                            x={coords.set2.sideClass.x}
                            y={coords.set2.sideClass.y}
                            width={coords.set2.sideClass.width}
                            height={coords.set2.sideClass.height}
                            paddingX={coords.set2.sideClass.paddingX}
                            paddingY={coords.set2.sideClass.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            classificationCode={label2.classificationCode}
                            productionYear={label2.productionYear}
                            retentionPeriod={label2.retentionPeriod}
                            title={label2.titleSide ?? label2.title}
                            fontFamily={label2.fontFamily}
                            titleIsBold={label2.titleIsBold}
                            productionYearIsBold={label2.productionYearIsBold}
                            titleFontSize={label2.titleFontSizeSide}
                        />

                        {/* 옆면 분류번호 라벨 2 */}
                        <EdgeClassLabel
                            x={coords.edge2.x}
                            y={coords.edge2.y}
                            width={coords.edge2.width}
                            height={coords.edge2.height}
                            paddingX={coords.edge2.paddingX}
                            paddingY={coords.edge2.paddingY}
                            scale={scale}
                            pageHeight={coords.page.height}
                            managementNumber={label2.managementNumber}
                            productionYear={label2.productionYear}
                            retentionPeriod={label2.retentionPeriod}
                            classificationCode={label2.classificationCode}
                            title={label2.titleEdge ?? label2.title}
                            departmentName={label2.departmentNameEdge ?? label2.departmentName}
                            fontFamily={label2.fontFamily}
                            isBold={label2.titleIsBold}
                            titleFontSize={label2.titleFontSizeEdge}
                            departmentNameFontSize={label2.departmentNameFontSizeEdge}
                            hideDepartmentOnEdge={label2.hideDepartmentOnEdge}
                        />
                    </>
                )}
            </div>

            {/* 안내 문구 */}
            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-medium mb-1">📐 폼텍 3629 규격</p>
                <p className="text-xs">
                    A4 용지 (210mm × 297mm)에 라벨 2세트가 배치됩니다.
                    <br />
                    실제 인쇄 시 양식과 동일한 위치에 출력됩니다.
                </p>
            </div>
        </div>
    );
}
