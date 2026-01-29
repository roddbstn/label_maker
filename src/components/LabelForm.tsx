"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { useLabelStore } from "@/store/labelStore";
import RichTextInput from "./RichTextInput";
import StyleToolbar from "./StyleToolbar";
import HistoryPanel from "./HistoryPanel";
import { useState } from "react";

// 폰트 크기 옵션 (단계별 선택)
const FONT_SIZE_OPTIONS = [
    { label: "Auto", value: 0 },
    { label: "중간", value: 36 }, // -5mm 효과를 위한 내부 값
    { label: "작게", value: 24 }, // -10mm 효과를 위한 내부 값
];

export default function LabelForm() {
    const {
        labels,
        currentLabelIndex,
        updateLabelData,
        downloadPDF,
        print,
        isGenerating,
        resetLabelData,
        history,
        addLabel,
        removeLabel,
        selectLabel,
    } = useLabelStore();

    // 현재 라벨 데이터
    const labelData = labels[currentLabelIndex];

    // 히스토리 패널 열림 상태
    const [historyOpen, setHistoryOpen] = useState(false);

    // 스크롤 컨테이너 ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevLabelsLengthRef = useRef(labels.length);

    // 필드별 선택 상태 및 폰트 크기 추적
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
    const [selectionFontSizes, setSelectionFontSizes] = useState<Record<string, number | undefined>>({});

    const handleSelectionChange = (fieldId: string) => (hasSelection: boolean, rect: DOMRect | null, fontSize?: number) => {
        // hasSelection이 true라 하더라도 실제로 해당 에디터가 활성화된 상태인지 확인
        setSelectedFields(prev => ({ ...prev, [fieldId]: hasSelection }));
        setSelectionFontSizes(prev => ({ ...prev, [fieldId]: fontSize }));
    };

    // 새 라벨 추가 시 자동 스크롤
    useEffect(() => {
        if (labels.length > prevLabelsLengthRef.current) {
            if (scrollContainerRef.current) {
                setTimeout(() => {
                    scrollContainerRef.current?.scrollTo({
                        left: scrollContainerRef.current.scrollWidth,
                        behavior: "smooth"
                    });
                }, 50);
            }
        }
        prevLabelsLengthRef.current = labels.length;
    }, [labels.length]);

    // 일반 입력 핸들러
    const handleInputChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        updateLabelData({ [field]: e.target.value });
    };

    // 필드 스타일 업데이트 (부분 선택 또는 전체)
    const toggleFieldBold = (field: string, currentVal?: boolean, inputId?: string) => {
        const selection = window.getSelection();
        const editor = inputId ? document.getElementById(inputId) : null;

        if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor?.contains(selection.anchorNode)) {
            // 선택된 텍스트가 있는 경우: 부분 Bold 적용
            import("./RichTextInput").then(({ applyTextStyle }) => {
                applyTextStyle(editor, "bold");
            });
        } else {
            // 선택된 텍스트가 없는 경우: 필드 전체 Bold 토글
            updateLabelData({ [field]: !currentVal });
        }
    };

    const setFieldFontSize = (field: string, size: number, inputId?: string) => {
        const selection = window.getSelection();
        const editor = inputId ? document.getElementById(inputId) : null;

        if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor?.contains(selection.anchorNode)) {
            // 선택된 텍스트가 있는 경우: 부분 글자 크기 적용 (size 0 포함)
            // UI에 즉시 반영하기 위해 상태 먼저 업데이트
            setSelectionFontSizes(prev => ({ ...prev, [field.replace('FontSize', '')]: size }));

            import("./RichTextInput").then(({ applyTextStyle }) => {
                applyTextStyle(editor, "fontSize", size.toString());
            });
        } else {
            // 선택된 텍스트가 없는 경우: 필드 전체 글자 크기 설정
            updateLabelData({ [field]: size === 0 ? undefined : size });
        }
    };

    // HTML에서 순수 텍스트 추출
    const htmlToPlainText = (html: string): string => {
        if (!html) return "";
        return html
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]*>/g, "")
            .trim();
    };

    // 라벨 제목 가져오기
    const getLabelTitle = (label: any): string => {
        const title = htmlToPlainText(label.title);
        return title.length > 15 ? title.slice(0, 15) + "..." : (title || "(제목 없음)");
    };

    if (!labelData) return null;

    return (
        <div className="space-y-4">
            {/* 라벨 탭 UI */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 48px",
                    gap: "8px",
                    alignItems: "center",
                    width: "100%"
                }}
            >
                <div
                    ref={scrollContainerRef}
                    style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        paddingBottom: "8px",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 #f1f5f9"
                    }}
                >
                    <div className="flex items-center gap-2" style={{ width: "max-content" }}>
                        {labels.map((label, index) => (
                            <div
                                key={label.id}
                                className={`
                                    flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer
                                    transition-all duration-200
                                    ${index === currentLabelIndex
                                        ? "bg-blue-500 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }
                                `}
                                onClick={() => selectLabel(index)}
                            >
                                <span className="text-sm font-medium whitespace-nowrap">
                                    라벨 {label.labelNumber}
                                </span>
                                {labels.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeLabel(label.id);
                                        }}
                                        className={`
                                            ml-1 w-5 h-5 flex items-center justify-center rounded-full
                                            transition-colors text-xs font-bold
                                            ${index === currentLabelIndex
                                                ? "hover:bg-blue-600 text-white/80 hover:text-white"
                                                : "hover:bg-gray-300 text-gray-500 hover:text-gray-700"
                                            }
                                        `}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={addLabel}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
            </div>

            {/* 현재 라벨 정보 */}
            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg flex items-center justify-between">
                <div>📝 <strong>라벨 {labelData.labelNumber}</strong> 편집 중</div>
                {labels.length > 1 && (
                    <select
                        value={currentLabelIndex}
                        onChange={(e) => selectLabel(Number(e.target.value))}
                        className="ml-2 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700"
                    >
                        {labels.map((label, index) => (
                            <option key={label.id} value={index}>
                                라벨 {label.labelNumber} - {getLabelTitle(label)}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* 히스토리 토글 */}
            <div>
                <button
                    type="button"
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                    <span className="flex items-center gap-2">📋 이전 기록 ({history.length})</span>
                    <span className={`transition-transform ${historyOpen ? "rotate-180" : ""}`}>▼</span>
                </button>
                {historyOpen && (
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                        <HistoryPanel />
                    </div>
                )}
            </div>

            <form className="space-y-6 mt-4" onSubmit={(e) => e.preventDefault()}>
                {/* 제목 필드 */}
                <div className="space-y-1 group">
                    <label className="block text-sm font-bold text-gray-700">
                        제목 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                        <RichTextInput
                            key={`title-${labelData.id}`}
                            id="title"
                            value={labelData.title}
                            onChange={(val) => updateLabelData({ title: val })}
                            onSelectionChange={handleSelectionChange('title')}
                            placeholder="예: 2024년도 아동복지 사업"
                            minHeight="80px"
                        />
                        <div className="flex items-center gap-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => toggleFieldBold('titleIsBold', labelData.titleIsBold, 'title')}
                                onMouseDown={(e) => e.preventDefault()}
                                className={`w-12 h-7 border rounded-md font-bold text-sm transition-colors shadow-sm ${labelData.titleIsBold ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                B
                            </button>
                            <div
                                className={`border rounded-md h-7 pr-1 flex items-center transition-colors ${selectedFields['title'] ? 'bg-white border-black ring-1 ring-black' : 'bg-gray-50/50 border-gray-200'}`}
                            >
                                <select
                                    tabIndex={-1}
                                    value={selectedFields['title'] && selectionFontSizes['title'] !== undefined ? selectionFontSizes['title'] : (labelData.titleFontSize || 0)}
                                    onChange={(e) => setFieldFontSize('titleFontSize', Number(e.target.value), 'title')}
                                    className={`text-xs bg-transparent focus:outline-none cursor-pointer border-none outline-none appearance-none pl-2 pr-6 h-full w-full ${selectedFields['title'] ? 'text-black font-bold' : 'text-gray-400 font-normal'}`}
                                >
                                    {selectedFields['title'] && selectionFontSizes['title'] === -1 && (
                                        <option value="-1"></option>
                                    )}
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value} className="text-gray-700 text-sm">{opt.label}</option>
                                    ))}
                                    {selectedFields['title'] && selectionFontSizes['title'] !== undefined && selectionFontSizes['title'] > 0 && selectionFontSizes['title'] !== 12 && !FONT_SIZE_OPTIONS.some(opt => opt.value === selectionFontSizes['title']) && (
                                        <option value={selectionFontSizes['title']}>{selectionFontSizes['title']} (커스텀)</option>
                                    )}
                                </select>
                                <span className={`text-[10px] absolute right-1 pointer-events-none ${selectedFields['title'] ? 'text-black font-bold' : 'text-gray-400'}`}>▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 생산연도 필드 */}
                <div className="space-y-1 group">
                    <label className="block text-sm font-bold text-gray-700">
                        생산연도 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                        <RichTextInput
                            key={`year-${labelData.id}`}
                            id="productionYear"
                            value={labelData.productionYear}
                            onChange={(val) => updateLabelData({ productionYear: val })}
                            onSelectionChange={handleSelectionChange('productionYear')}
                            placeholder="예: 2024"
                            minHeight="45px"
                        />
                        <div className="flex items-center gap-2 transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => toggleFieldBold('productionYearIsBold', labelData.productionYearIsBold, 'productionYear')}
                                onMouseDown={(e) => e.preventDefault()}
                                className={`w-12 h-7 border rounded-md font-bold text-sm transition-colors shadow-sm ${labelData.productionYearIsBold ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                B
                            </button>
                            <div
                                className={`border rounded-md h-7 pr-1 flex items-center transition-colors ${selectedFields['productionYear'] ? 'bg-white border-black ring-1 ring-black' : 'bg-gray-50/50 border-gray-200'}`}
                            >
                                <select
                                    tabIndex={-1}
                                    value={selectedFields['productionYear'] && selectionFontSizes['productionYear'] !== undefined ? selectionFontSizes['productionYear'] : (labelData.productionYearFontSize || 0)}
                                    onChange={(e) => setFieldFontSize('productionYearFontSize', Number(e.target.value), 'productionYear')}
                                    className={`text-xs bg-transparent focus:outline-none cursor-pointer border-none outline-none appearance-none pl-2 pr-6 h-full w-full ${selectedFields['productionYear'] ? 'text-black font-bold' : 'text-gray-400 font-normal'}`}
                                >
                                    {selectedFields['productionYear'] && selectionFontSizes['productionYear'] === -1 && (
                                        <option value="-1"></option>
                                    )}
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value} className="text-gray-700 text-sm">{opt.label}</option>
                                    ))}
                                    {selectedFields['productionYear'] && selectionFontSizes['productionYear'] !== undefined && selectionFontSizes['productionYear'] > 0 && selectionFontSizes['productionYear'] !== 12 && !FONT_SIZE_OPTIONS.some(opt => opt.value === selectionFontSizes['productionYear']) && (
                                        <option value={selectionFontSizes['productionYear']}>{selectionFontSizes['productionYear']} (커스텀)</option>
                                    )}
                                </select>
                                <span className={`text-[10px] absolute right-1 pointer-events-none ${selectedFields['productionYear'] ? 'text-black font-bold' : 'text-gray-400'}`}>▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 부서명 필드 */}
                <div className="space-y-1 group">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-gray-700">부서명</label>
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            Shift + Enter로 줄바꿈 가능
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <RichTextInput
                            key={`dept-${labelData.id}`}
                            id="departmentName"
                            value={labelData.departmentName}
                            onChange={(val) => updateLabelData({ departmentName: val })}
                            onSelectionChange={handleSelectionChange('departmentName')}
                            placeholder="예: 대전광역시아동보호전문기관"
                            minHeight="80px"
                        />
                        <div className="flex items-center gap-2 transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => toggleFieldBold('departmentNameIsBold', labelData.departmentNameIsBold, 'departmentName')}
                                onMouseDown={(e) => e.preventDefault()}
                                className={`w-12 h-7 border rounded-md font-bold text-sm transition-colors shadow-sm ${labelData.departmentNameIsBold ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                B
                            </button>
                            <div
                                className={`border rounded-md h-7 pr-1 flex items-center transition-colors ${selectedFields['departmentName'] ? 'bg-white border-black ring-1 ring-black' : 'bg-gray-50/50 border-gray-200'}`}
                            >
                                <select
                                    tabIndex={-1}
                                    value={selectedFields['departmentName'] && selectionFontSizes['departmentName'] !== undefined ? selectionFontSizes['departmentName'] : (labelData.departmentNameFontSize || 0)}
                                    onChange={(e) => setFieldFontSize('departmentNameFontSize', Number(e.target.value), 'departmentName')}
                                    className={`text-xs bg-transparent focus:outline-none cursor-pointer border-none outline-none appearance-none pl-2 pr-6 h-full w-full ${selectedFields['departmentName'] ? 'text-black font-bold' : 'text-gray-400 font-normal'}`}
                                >
                                    {selectedFields['departmentName'] && selectionFontSizes['departmentName'] === -1 && (
                                        <option value="-1"></option>
                                    )}
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value} className="text-gray-700 text-sm">{opt.label}</option>
                                    ))}
                                    {selectedFields['departmentName'] && selectionFontSizes['departmentName'] !== undefined && selectionFontSizes['departmentName'] > 0 && selectionFontSizes['departmentName'] !== 12 && !FONT_SIZE_OPTIONS.some(opt => opt.value === selectionFontSizes['departmentName']) && (
                                        <option value={selectionFontSizes['departmentName']}>{selectionFontSizes['departmentName']} (커스텀)</option>
                                    )}
                                </select>
                                <span className={`text-[10px] absolute right-1 pointer-events-none ${selectedFields['departmentName'] ? 'text-black font-bold' : 'text-gray-400'}`}>▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 나머지 일반 필드들 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">분류번호</label>
                        <input
                            type="text"
                            value={labelData.classificationCode}
                            onChange={handleInputChange("classificationCode")}
                            placeholder="예: 사업, 회계"
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">보존기간</label>
                        <select
                            value={labelData.retentionPeriod}
                            onChange={handleInputChange("retentionPeriod")}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">선택하세요</option>
                            <option value="영구">영구</option>
                            <option value="준영구">준영구</option>
                            <option value="30년">30년</option>
                            <option value="10년">10년</option>
                            <option value="5년">5년</option>
                            <option value="3년">3년</option>
                            <option value="1년">1년</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">관리번호</label>
                        <input
                            type="text"
                            value={labelData.managementNumber}
                            onChange={handleInputChange("managementNumber")}
                            placeholder="예: A-001"
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={resetLabelData}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-95"
                    >
                        초기화
                    </button>
                    <button
                        type="button"
                        onClick={downloadPDF}
                        disabled={isGenerating || !labelData.title || !labelData.productionYear}
                        className="flex-1 py-3 px-4 border border-blue-500 rounded-xl text-blue-600 font-medium hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <span className="animate-spin text-lg">⏳</span> : <span className="text-lg">📄</span>}
                        PDF 다운로드
                    </button>
                    <button
                        type="button"
                        onClick={print}
                        disabled={isGenerating || !labelData.title || !labelData.productionYear}
                        className="flex-1 py-3 px-4 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">🖨️</span>
                        바로 인쇄
                    </button>
                </div>
            </form>
        </div>
    );
}
