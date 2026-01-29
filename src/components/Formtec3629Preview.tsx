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
 * HTML을 미리보기용으로 정규화 및 스케일 조정
 */
function normalizeHtmlForPreview(html: string, scale: number): string {
    if (!html) return "";

    // pt 단위 스타일 추출 및 스케일 적용
    // 예: font-size: 12pt -> font-size: (12 * ptToMm * scale)px
    let processedHtml = html.replace(/font-size:\s*(\d+(\.\d+)?)pt/gi, (match, p1) => {
        const pt = parseFloat(p1);
        const ptToMm = 0.3528;
        const px = pt * ptToMm * scale;
        return `font-size: ${px}px`;
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
}: AutoFitTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(baseSize);

    const displayText = text || fallback;
    const normalizedHtml = isHtml ? normalizeHtmlForPreview(text, scale) : "";

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
                    dangerouslySetInnerHTML={{ __html: normalizedHtml }}
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
    scale: number;
    pageHeight: number;
    children?: React.ReactNode;
    className?: string;
    isVertical?: boolean;
}

/**
 * 라벨 박스 컴포넌트
 * A4 좌하단 원점 좌표를 CSS top/left로 변환
 */
function LabelBox({
    x,
    y,
    width,
    height,
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
            className={`absolute bg-white rounded-sm overflow-hidden ${className}`}
            style={{
                left: mmToPx(x, scale),
                top: mmToPx(topY, scale),
                width: mmToPx(width, scale),
                height: mmToPx(height, scale),
                border: "none",
                boxSizing: 'border-box'
            }}
        >
            <div
                className={`w-full h-full flex items-center justify-center text-xs text-gray-800 ${isVertical ? "writing-mode-vertical" : ""
                    }`}
                style={{
                    writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
                    textOrientation: isVertical ? "mixed" : "mixed",
                }}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * 측면 분류번호 라벨 (93×28mm)
 */
function SideClassLabel({
    x,
    y,
    scale,
    pageHeight,
    classificationCode,
    productionYear,
    retentionPeriod,
    title,
    fontFamily,
    isBold,
    titleFontSize,
}: {
    x: number;
    y: number;
    scale: number;
    pageHeight: number;
    classificationCode: string;
    productionYear: string;
    retentionPeriod: string;
    title: string;
    fontFamily?: string;
    isBold?: boolean;
    titleFontSize?: number; // pt 단위
}) {
    const { padding, topRow, bottomRow } = FORMTEC_3629_COORDS.sideClassInternal;
    // 라벨 크기는 FORMTEC_3629_COORDS에서 가져옴 (91x26mm)
    const labelWidth = 91;
    const labelHeight = 26;
    const innerWidth = labelWidth - padding * 2;
    const innerHeight = labelHeight - padding * 2;

    const topY = pageHeight - y - labelHeight;

    return (
        <div
            className="absolute bg-white overflow-hidden"
            style={{
                left: mmToPx(x, scale),
                top: mmToPx(topY, scale),
                width: mmToPx(labelWidth, scale),
                height: mmToPx(labelHeight, scale),
                border: `${Math.max(1, mmToPx(0.5, scale))}px solid #000000`,
                boxSizing: 'border-box'
            }}
        >
            {/* 내부 테이블 컨테이너 */}
            <div className="w-full h-full flex flex-col">
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        flex: 1, // 높이를 유연하게 조절
                        boxSizing: 'border-box'
                    }}
                >
                    {[
                        { text: "분류\n번호", isLabel: true },
                        { text: classificationCode || "", isLabel: false },
                        { text: "생산\n연도", isLabel: true },
                        { text: productionYear || "", isLabel: false },
                        { text: "보존\n기간", isLabel: true },
                        { text: retentionPeriod || "", isLabel: false }
                    ].map((item, i) => {
                        const cellHeightPx = mmToPx(12.5, scale);
                        const fontSizePx = mmToPx(4.0, scale); // 3.2mm에서 4.0mm로 상향

                        return (
                            <div
                                key={i}
                                className="bg-white text-gray-800"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flex: 1, // 너비를 비율로 설정하여 전체 폭에 완벽히 맞춤
                                    height: '100%',
                                    fontSize: fontSizePx,
                                    fontFamily: !item.isLabel && fontFamily ? fontFamily : undefined,
                                    boxSizing: 'border-box',
                                    textAlign: 'center',
                                    borderRight: i < 5 ? `${Math.max(1, mmToPx(0.5, scale))}px solid #000000` : "none",
                                    borderBottom: `${Math.max(1, mmToPx(0.5, scale))}px solid #000000`,
                                }}
                            >
                                <span style={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.2,
                                }}>
                                    {item.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* 하단 행: 2칸 */}
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        flex: 1, // 상단 행과 동일한 비율
                        boxSizing: 'border-box'
                    }}
                >
                    <div
                        className="bg-white text-gray-800"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: mmToPx(21, scale),
                            height: '100%',
                            fontSize: mmToPx(3.2, scale),
                            boxSizing: 'border-box',
                            borderRight: `${Math.max(1, mmToPx(0.5, scale))}px solid #000000`,
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            minWidth: mmToPx(10, scale),
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                lineHeight: 1.1,
                                fontSize: mmToPx(3.2, scale), // 크기 통일
                                fontWeight: 'normal',
                            }}>
                                <span>제</span>
                                <span>목</span>
                            </div>
                            <div style={{
                                fontSize: mmToPx(3.2, scale), // 크기 통일
                                lineHeight: 1.1,
                                fontWeight: 'normal',
                                whiteSpace: 'nowrap',
                            }}>
                                (보존종료)
                            </div>
                        </div>
                    </div>
                    {/* 제목 값 셀 */}
                    <div
                        className="font-medium bg-white text-gray-800"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            height: mmToPx(12.5, scale),
                            fontSize: titleFontSize && titleFontSize > 0
                                ? mmToPx(titleFontSize * 0.3528, scale)
                                : mmToPx(3.8, scale),
                            fontFamily: fontFamily || undefined,
                            fontWeight: isBold ? "bold" : undefined,
                            boxSizing: 'border-box',
                            padding: `0 ${mmToPx(2, scale)}px`,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{
                            width: '100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {htmlToPlainText(title) || "제목을 입력하세요"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * 옆면 분류번호 라벨 (16×256mm, 세로)
 */
function EdgeClassLabel({
    x,
    y,
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
}: {
    x: number;
    y: number;
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
}) {
    const { paddingX, paddingY, innerWidth, rows } = FORMTEC_3629_COORDS.edgeInternal;
    const labelWidth = 14;  // 16mm에서 2mm 축소
    const labelHeight = 254; // 256mm에서 2mm 축소
    const topY = pageHeight - y - labelHeight;

    // 기본 폰트 크기 상향 (3.2 -> 3.6)
    const effectiveFontSize = fontSize || 3.6;

    // 부서명에서 줄바꿈을 공백으로 대체 (옆면은 항상 1열로 표시)
    const deptNameForEdge = htmlToPlainText(departmentName).replace(/\n/g, ' ');

    const values = [
        "", managementNumber, "", productionYear, "", retentionPeriod,
        "", classificationCode, "", htmlToPlainText(title), "", deptNameForEdge,
    ];

    // 제목과 부서명 인덱스 (values 배열에서)
    const titleIndex = 9;
    const deptIndex = 11;

    let currentY = paddingY;

    return (
        <div
            className="absolute bg-white overflow-hidden"
            style={{
                left: mmToPx(x, scale),
                top: mmToPx(topY, scale),
                width: mmToPx(labelWidth, scale),
                height: mmToPx(labelHeight, scale),
                border: `${Math.max(1, mmToPx(0.5, scale))}px solid #000000`,
                boxSizing: 'border-box'
            }}
        >
            {/* 내부 테이블 컨테이너 */}
            <div
                className="w-full h-full overflow-hidden flex flex-col"
            >
                {rows.map((row, i) => {
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
                            case "부서명":
                                displayText = "부서명";
                                break;
                        }
                    }

                    const cellY = currentY;
                    currentY += row.height;

                    // 세로 텍스트가 필요한 영역 (높이가 20mm 이상)
                    const needsVertical = row.height > 20;

                    // 제목/부서명 영역은 더 큰 폰트와 굵게
                    const isTitleOrDept = i === titleIndex || i === deptIndex;
                    const fontSize = isLabel ? 2.75 : (isTitleOrDept ? 9 : 3.25);
                    const rowHeightPx = mmToPx(row.height, scale);
                    const isLast = i === rows.length - 1;

                    // html2canvas 호환을 위해 absolute positioning 사용
                    const currentFontSizePx = isLabel ? mmToPx(2.75, scale) : (
                        i === titleIndex && titleFontSize && titleFontSize > 0
                            ? mmToPx(titleFontSize * 0.3528, scale)
                            : i === deptIndex && departmentNameFontSize && departmentNameFontSize > 0
                                ? mmToPx(departmentNameFontSize * 0.3528, scale)
                                : mmToPx(effectiveFontSize, scale)
                    );

                    return (
                        <div
                            key={i}
                            className={`overflow-hidden bg-white text-gray-800 ${isTitleOrDept ? "font-bold" : "font-medium"}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: "100%",
                                height: rowHeightPx,
                                fontSize: currentFontSizePx,
                                // 칸 사이 선만 그림 (마지막 칸 제외)
                                borderBottom: !isLast ? `${Math.max(1, mmToPx(0.5, scale))}px solid #000000` : "none",
                                fontFamily: !isLabel && fontFamily ? fontFamily : undefined,
                                boxSizing: 'border-box',
                            }}
                        >
                            {needsVertical ? (
                                isTitleOrDept ? (
                                    (() => {
                                        // 셀 크기 (픽셀)
                                        const cellHeightPx = rowHeightPx;
                                        const cellWidthPx = mmToPx(innerWidth, scale);

                                        // 패딩 (상하좌우)
                                        const verticalPadding = mmToPx(3, scale);
                                        const horizontalPadding = mmToPx(2, scale);

                                        // 사용 가능한 영역
                                        const availableHeightPx = cellHeightPx - verticalPadding;
                                        const availableWidthPx = cellWidthPx - horizontalPadding;

                                        // 텍스트 길이
                                        const textLength = displayText.length;

                                        // 세로쓰기에서 각 글자는 가로 폭을 차지함
                                        // 글자당 할당 가능한 높이 계산
                                        const charHeightPx = availableHeightPx / Math.max(textLength, 1);

                                        // 폰트 크기 = 글자당 높이의 98% (여백 최소화)
                                        // 단, 가로 폭을 넘지 않도록 제한
                                        let fontSizePx = charHeightPx * 0.98;
                                        fontSizePx = Math.min(fontSizePx, availableWidthPx * 0.85);
                                        fontSizePx = Math.min(fontSizePx, mmToPx(4.5, scale)); // 최대 4.5mm
                                        fontSizePx = Math.max(fontSizePx, mmToPx(1.5, scale)); // 최소 1.5mm

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
                                                    {displayText.split('').map((char, idx) => {
                                                        const isParenthesis = char === '(' || char === ')';
                                                        const isSpace = char === ' ';

                                                        if (isSpace) {
                                                            return <span key={idx} style={{ display: "block", height: fontSizePx * 0.5 }}>&nbsp;</span>;
                                                        }

                                                        if (isParenthesis) {
                                                            return <span key={idx} style={{ display: "inline-block", transform: "rotate(90deg)", lineHeight: 1 }}>{char}</span>;
                                                        }

                                                        return <span key={idx} style={{ lineHeight: 1 }}>{char}</span>;
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: displayText === "제   목" ? "space-between" : "center",
                                            // 짧은 칸(라벨 등)은 가로 방향이 더 시인성이 좋음
                                            whiteSpace: displayText.includes('\n') ? "pre-line" : "nowrap",
                                            maxHeight: "100%",
                                            width: "100%",
                                            height: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            lineHeight: 1.2,
                                            padding: displayText === "제   목" ? `0 ${mmToPx(1.5, scale)}px` : 0,
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        {displayText === "제   목" ? (
                                            <>
                                                <span>제</span>
                                                <span>목</span>
                                            </>
                                        ) : (
                                            displayText
                                        )}
                                    </span>
                                )
                            ) : (
                                // flex박스로 중앙 정렬
                                <span style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: row.label === "제목" ? "space-between" : "center",
                                    whiteSpace: displayText.includes('\n') ? "pre-line" : "nowrap",
                                    width: row.label === "제목" ? `calc(100% - ${mmToPx(4, scale)}px)` : "100%",
                                    lineHeight: 1.2,
                                    textAlign: 'center',
                                }}>
                                    {row.label === "제목" ? (
                                        <>
                                            <span>제</span>
                                            <span>목</span>
                                        </>
                                    ) : (
                                        displayText
                                    )}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div >
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

    // 미리보기 스케일 (A4 너비를 기준)
    const previewWidth = 380;
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold text-center"
                        >
                            <AutoFitText
                                text={label1.title}
                                containerWidth={mmToPx(coords.set1.title.width, scale)}
                                containerHeight={mmToPx(coords.set1.title.height, scale)}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label1.productionYear}
                                containerWidth={mmToPx(coords.set1.year.width, scale)}
                                containerHeight={mmToPx(coords.set1.year.height, scale)}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label1.departmentName}
                                containerWidth={mmToPx(coords.set1.department.width, scale)}
                                containerHeight={mmToPx(coords.set1.department.height, scale)}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            classificationCode={label1.classificationCode}
                            productionYear={label1.productionYear}
                            retentionPeriod={label1.retentionPeriod}
                            title={label1.title}
                            fontFamily={label1.fontFamily}
                            isBold={label1.titleIsBold}
                            titleFontSize={label1.titleFontSize}
                        />

                        {/* 옆면 분류번호 라벨 1 */}
                        <EdgeClassLabel
                            x={coords.edge1.x}
                            y={coords.edge1.y}
                            scale={scale}
                            pageHeight={coords.page.height}
                            managementNumber={label1.managementNumber}
                            productionYear={label1.productionYear}
                            retentionPeriod={label1.retentionPeriod}
                            classificationCode={label1.classificationCode}
                            title={label1.title}
                            departmentName={label1.departmentName}
                            fontFamily={label1.fontFamily}
                            isBold={label1.titleIsBold}
                            titleFontSize={label1.titleFontSize}
                            departmentNameFontSize={label1.departmentNameFontSize}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold text-center"
                        >
                            <AutoFitText
                                text={label2.title}
                                containerWidth={mmToPx(coords.set2.title.width, scale)}
                                containerHeight={mmToPx(coords.set2.title.height, scale)}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label2.productionYear}
                                containerWidth={mmToPx(coords.set2.year.width, scale)}
                                containerHeight={mmToPx(coords.set2.year.height, scale)}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            className="font-bold"
                        >
                            <AutoFitText
                                text={label2.departmentName}
                                containerWidth={mmToPx(coords.set2.department.width, scale)}
                                containerHeight={mmToPx(coords.set2.department.height, scale)}
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
                            scale={scale}
                            pageHeight={coords.page.height}
                            classificationCode={label2.classificationCode}
                            productionYear={label2.productionYear}
                            retentionPeriod={label2.retentionPeriod}
                            title={label2.title}
                            fontFamily={label2.fontFamily}
                            isBold={label2.titleIsBold}
                            titleFontSize={label2.titleFontSize}
                        />

                        {/* 옆면 분류번호 라벨 2 */}
                        <EdgeClassLabel
                            x={coords.edge2.x}
                            y={coords.edge2.y}
                            scale={scale}
                            pageHeight={coords.page.height}
                            managementNumber={label2.managementNumber}
                            productionYear={label2.productionYear}
                            retentionPeriod={label2.retentionPeriod}
                            classificationCode={label2.classificationCode}
                            title={label2.title}
                            departmentName={label2.departmentName}
                            fontFamily={label2.fontFamily}
                            isBold={label2.titleIsBold}
                            titleFontSize={label2.titleFontSize}
                            departmentNameFontSize={label2.departmentNameFontSize}
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
