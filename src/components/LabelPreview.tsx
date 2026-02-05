"use client";

import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useLabelStore } from "@/store/labelStore";
import Formtec3629Preview from "./Formtec3629Preview";
import * as gtag from "@/lib/gtag";

type PreviewTab = "file" | "formtec";

/**
 * 화일 규격 (mm)
 */
const FILE_SPECS = {
    width: 240,
    height: 310,
};

// 라벨 위치 (mm 단위, 원점 = 좌하단)
const LABEL_POSITIONS = {
    title: {
        left: 50,
        bottom: 218,
        width: 120,
        height: 34,
    },
    productionYear: {
        left: 78,
        bottom: 127,
        width: 62,
        height: 17,
    },
    departmentName: {
        left: 68,
        bottom: 56,
        width: 84,
        height: 26,
    },
};

/**
 * HTML에서 사용자가 입력한 줄바꿈 개수 확인
 * - <br> 태그
 * - <div> 태그 (contentEditable에서 줄바꿈 시 생성됨)
 * - 실제 newline 문자
 */
function countUserLineBreaks(html: string): number {
    if (!html) return 0;

    // <br> 태그 개수
    const brMatches = html.match(/<br\s*\/?>/gi) || [];

    // <div> 태그 개수 (첫 번째 제외 - 첫 줄은 div 없이 시작할 수 있음)
    const divMatches = html.match(/<div[^>]*>/gi) || [];

    // 실제 newline 문자 개수
    const newlineMatches = html.match(/\n/g) || [];

    return brMatches.length + divMatches.length + newlineMatches.length;
}

/**
 * HTML을 미리보기용으로 정규화
 * - <div> 태그를 줄바꿈으로 변환
 * - 연속된 줄바꿈 정리
 */
function normalizeHtmlForPreview(html: string): string {
    if (!html) return '';

    return html
        // <div>를 줄바꿈으로 변환
        .replace(/<div[^>]*>/gi, '<br>')
        .replace(/<\/div>/gi, '')
        // 연속된 br 태그 정리
        .replace(/(<br\s*\/?>\s*)+/gi, '<br>')
        // 시작 부분의 br 제거
        .replace(/^<br\s*\/?>/gi, '')
        // 줄바꿈 문자도 br로 변환
        .replace(/\n/g, '<br>');
}

/**
 * 한 줄 유지 자동 크기 조절 컴포넌트
 * - 사용자가 줄바꿈하지 않은 텍스트는 한 줄로 유지
 * - 사용자가 줄바꿈한 텍스트는 해당 줄바꿈만 유지
 */
function AutoFitSingleLine({
    html,
    fallback,
    containerWidth,
    containerHeight,
    autoFit,
    baseSize,
    minSize = 6,
}: {
    html: string;
    fallback: string;
    containerWidth: number;
    containerHeight: number;
    autoFit: boolean;
    baseSize: number;
    minSize?: number;
}) {
    const measureRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [ready, setReady] = useState(false);

    const userLineBreaks = countUserLineBreaks(html);
    const normalizedHtml = normalizeHtmlForPreview(html);

    useLayoutEffect(() => {
        if (!autoFit || !measureRef.current || !html) {
            setScale(1);
            setReady(true);
            return;
        }

        const el = measureRef.current;
        // 리셋
        el.style.transform = 'scale(1)';
        el.style.fontSize = `${baseSize}px`;

        // 잠시 대기 후 측정 (렌더링 완료 대기)
        requestAnimationFrame(() => {
            const textWidth = el.scrollWidth;
            const textHeight = el.scrollHeight;

            const availableWidth = containerWidth - 8;
            const availableHeight = containerHeight - 4;

            let newScale = 1;

            if (userLineBreaks === 0) {
                // 사용자가 줄바꿈을 하지 않은 경우: 한 줄로 유지하면서 크기 축소
                if (textWidth > availableWidth) {
                    newScale = availableWidth / textWidth;
                }
                if (textHeight * newScale > availableHeight) {
                    newScale = Math.min(newScale, availableHeight / textHeight);
                }
            } else {
                // 사용자가 줄바꿈한 경우: 가로/세로 모두 고려
                const scaleX = textWidth > availableWidth ? availableWidth / textWidth : 1;
                const scaleY = textHeight > availableHeight ? availableHeight / textHeight : 1;
                newScale = Math.min(scaleX, scaleY);
            }

            // 최소 스케일 제한
            const minScale = minSize / baseSize;
            newScale = Math.max(minScale, newScale);

            setScale(newScale);
            setReady(true);
        });
    }, [html, normalizedHtml, containerWidth, containerHeight, autoFit, baseSize, minSize, userLineBreaks]);

    if (!html) {
        return <span className="text-gray-300 italic" style={{ fontSize: baseSize }}>{fallback}</span>;
    }

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <div
                ref={measureRef}
                style={{
                    fontSize: `${baseSize}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    whiteSpace: userLineBreaks === 0 ? 'nowrap' : 'pre-wrap',
                    lineHeight: 1.3,
                    textAlign: 'center',
                    opacity: ready ? 1 : 0,
                }}
                className="text-gray-800 font-medium"
                dangerouslySetInnerHTML={{ __html: normalizedHtml }}
            />
        </div>
    );
}

/**
 * mm를 미리보기 스케일에 맞게 변환
 */
function mmToPreview(mm: number, scale: number): number {
    return mm * scale;
}

interface LabelPreviewProps {
    autoFitText?: boolean;
}

/**
 * 실제 화일 크기 기반 라벨 미리보기 + 폼텍 3629 양식 미리보기
 */
export default function LabelPreview({ autoFitText = true }: LabelPreviewProps) {
    const { labels, currentLabelIndex } = useLabelStore();
    const [activeTab, setActiveTab] = useState<PreviewTab>("formtec");
    const [currentPage, setCurrentPage] = useState(0);

    // 라벨 선택 시 해당 라벨이 있는 페이지로 자동 전환
    useEffect(() => {
        const targetPage = Math.floor(currentLabelIndex / 2);
        setCurrentPage(targetPage);
    }, [currentLabelIndex]);

    // 현재 라벨 데이터 직접 접근
    const labelData = labels[currentLabelIndex] || {
        id: "",
        title: "",
        productionYear: "",
        departmentName: "",
        classificationCode: "",
        retentionPeriod: "",
        managementNumber: "",
    };

    const previewWidth = 280;
    const scale = previewWidth / FILE_SPECS.width;
    const previewHeight = FILE_SPECS.height * scale;

    // 각 라벨의 픽셀 크기 계산
    const titleWidth = mmToPreview(LABEL_POSITIONS.title.width, scale);
    const titleHeight = mmToPreview(LABEL_POSITIONS.title.height, scale);
    const yearWidth = mmToPreview(LABEL_POSITIONS.productionYear.width, scale);
    const yearHeight = mmToPreview(LABEL_POSITIONS.productionYear.height, scale);
    const deptWidth = mmToPreview(LABEL_POSITIONS.departmentName.width, scale);
    const deptHeight = mmToPreview(LABEL_POSITIONS.departmentName.height, scale);

    // 페이지네이션
    const totalPages = Math.ceil(labels.length / 2);

    return (
        <div className="space-y-3">
            {/* 탭 전환 UI */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => {
                        gtag.event({
                            action: "preview_form_click",
                            category: "interaction",
                            label: "Form Template Tab"
                        });
                        setActiveTab("formtec");
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "formtec"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    📄 양식 미리보기
                </button>
                <button
                    type="button"
                    onClick={() => {
                        gtag.event({
                            action: "preview_file_click",
                            category: "interaction",
                            label: "Actual File Tab"
                        });
                        setActiveTab("file");
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "file"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    📁 화일 미리보기
                </button>
            </div>

            {/* 폼텍 3629 양식 미리보기 */}
            {activeTab === "formtec" && (
                <div>
                    <Formtec3629Preview currentPage={currentPage} />

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ◀ 이전
                            </button>
                            <span className="text-sm text-gray-600">
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                다음 ▶
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 화일 미리보기 (기존) */}
            {activeTab === "file" && (
                <>
                    <p className="text-sm font-medium text-gray-600 mb-2">📁 실제 화일 미리보기</p>

                    {/* 화일 미리보기 컨테이너 */}
                    <div
                        className="relative mx-auto rounded-lg overflow-hidden shadow-lg"
                        style={{
                            width: previewWidth,
                            height: previewHeight,
                            backgroundColor: "#E6C200",
                        }}
                    >
                        {/* 제목 라벨 */}
                        <div
                            className="absolute bg-white rounded-sm flex items-center justify-center p-1 overflow-hidden"
                            style={{
                                left: mmToPreview(LABEL_POSITIONS.title.left, scale),
                                bottom: mmToPreview(LABEL_POSITIONS.title.bottom, scale),
                                width: titleWidth,
                                height: titleHeight,
                            }}
                        >
                            <AutoFitSingleLine
                                html={labelData.title}
                                fallback="제목"
                                containerWidth={titleWidth}
                                containerHeight={titleHeight}
                                autoFit={autoFitText}
                                baseSize={14}
                                minSize={6}
                            />
                        </div>

                        {/* 생산연도 라벨 */}
                        <div
                            className="absolute bg-white rounded-sm flex items-center justify-center p-1 overflow-hidden"
                            style={{
                                left: mmToPreview(LABEL_POSITIONS.productionYear.left, scale),
                                bottom: mmToPreview(LABEL_POSITIONS.productionYear.bottom, scale),
                                width: yearWidth,
                                height: yearHeight,
                            }}
                        >
                            <AutoFitSingleLine
                                html={labelData.productionYear}
                                fallback="연도"
                                containerWidth={yearWidth}
                                containerHeight={yearHeight}
                                autoFit={autoFitText}
                                baseSize={11}
                                minSize={5}
                            />
                        </div>

                        {/* 부서명 라벨 */}
                        <div
                            className="absolute bg-white rounded-sm flex items-center justify-center p-1 overflow-hidden"
                            style={{
                                left: mmToPreview(LABEL_POSITIONS.departmentName.left, scale),
                                bottom: mmToPreview(LABEL_POSITIONS.departmentName.bottom, scale),
                                width: deptWidth,
                                height: deptHeight,
                            }}
                        >
                            <AutoFitSingleLine
                                html={labelData.departmentName}
                                fallback="부서명"
                                containerWidth={deptWidth}
                                containerHeight={deptHeight}
                                autoFit={autoFitText}
                                baseSize={11}
                                minSize={5}
                            />
                        </div>

                        {/* 화일 왼쪽 측면 (척추) */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-4"
                            style={{ backgroundColor: "#C4A000" }}
                        />
                    </div>

                    {/* 안내 문구 */}
                    <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                        <p className="font-medium mb-1">📐 실제 화일 비율</p>
                        <p className="text-xs">
                            화일 크기: 240mm × 310mm
                            <br />
                            각 라벨이 실제 위치에 표시됩니다.
                        </p>
                    </div>

                    {/* 스타일링 팁 */}
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                        <p>✨ 텍스트를 드래그하여 선택 → 글꼴/크기/굵기 변경</p>
                        <p>↵ Shift+Enter로 줄바꿈</p>
                    </div>
                </>
            )}
        </div>
    );
}
