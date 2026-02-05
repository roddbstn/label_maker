"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { useLabelStore } from "@/store/labelStore";
import RichTextInput from "./RichTextInput";
import StyleToolbar from "./StyleToolbar";
import { useState } from "react";
import * as gtag from "@/lib/gtag";

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

    // 스크롤 컨테이너 ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevLabelsLengthRef = useRef(labels.length);

    // 필드별 선택 상태 및 폰트 크기 추적
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
    const [selectionFontSizes, setSelectionFontSizes] = useState<Record<string, number | undefined>>({});

    const handleSelectionChange = (fieldId: string) => (hasSelection: boolean, rect: DOMRect | null, fontSize?: number) => {
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
            import("./RichTextInput").then(({ applyTextStyle }) => {
                applyTextStyle(editor, "bold");
            });
        } else {
            updateLabelData({ [field]: !currentVal });
        }
    };

    const setFieldFontSize = (field: string, size: number, inputId?: string) => {
        const selection = window.getSelection();
        const editor = inputId ? document.getElementById(inputId) : null;

        if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor?.contains(selection.anchorNode)) {
            setSelectionFontSizes(prev => ({ ...prev, [field.replace('FontSize', '')]: size }));
            import("./RichTextInput").then(({ applyTextStyle }) => {
                applyTextStyle(editor, "fontSize", size.toString());
            });
        } else {
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

    // 최근 사용된 부서명 추천 목록 생성
    const getRecentDepartments = useCallback(() => {
        const allDepts = [
            ...labels.map(l => l.departmentName),
            ...history.map(h => h.labelData.departmentName)
        ];

        const uniqueDepts = Array.from(new Set(allDepts))
            .filter(dept => dept && dept.trim().length > 0)
            .slice(0, 5);

        return uniqueDepts;
    }, [labels, history]);

    const recentDepts = getRecentDepartments();

    if (!labelData) return null;

    // 라벨을 2개씩 페이지로 그룹핑
    const labelPages: Array<typeof labels> = [];
    for (let i = 0; i < labels.length; i += 2) {
        labelPages.push(labels.slice(i, i + 2));
    }

    return (
        <div className="space-y-2">
            {/* 라벨 탭 UI */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 48px",
                    gap: "8px",
                    alignItems: "flex-start",
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
                    <div className="flex items-start gap-4" style={{ width: "max-content" }}>
                        {labelPages.map((pageLabels, pageIndex) => (
                            <div key={`page-${pageIndex}`} className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                    {pageLabels.map((label) => {
                                        const labelIndex = labels.findIndex(l => l.id === label.id);
                                        const isActive = labelIndex === currentLabelIndex;
                                        return (
                                            <div
                                                key={label.id}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer
                                                    transition-all duration-200
                                                    ${isActive
                                                        ? "bg-[#0084ff] text-white shadow-[0_4px_12px_-2px_rgba(0,132,255,0.3)]"
                                                        : "bg-[#f1f3f5] text-[#495057] hover:bg-[#e9ecef]"
                                                    }
                                                `}
                                                onClick={() => selectLabel(labelIndex)}
                                            >
                                                <span className="text-[15px] font-bold whitespace-nowrap">
                                                    라벨 {label.labelNumber}
                                                </span>
                                                {labels.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeLabel(label.id);
                                                        }}
                                                        className="ml-1 w-4 h-4 flex items-center justify-center rounded-full transition-colors text-base font-medium opacity-70 hover:opacity-100"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="relative w-full mt-1">
                                    <div className="flex items-center justify-center gap-2 px-[15%] h-[24px]">
                                        {pageLabels.length === 2 ? (
                                            <>
                                                <div className="flex-1 h-full flex flex-col">
                                                    <div className="h-1/2 border-l-2 border-[#dee2e6]"></div>
                                                    <div className="border-t-2 border-[#dee2e6]"></div>
                                                </div>
                                                <span className="text-[11px] font-bold text-[#adb5bd] whitespace-nowrap">
                                                    페이지 {pageIndex + 1}
                                                </span>
                                                <div className="flex-1 h-full flex flex-col">
                                                    <div className="h-1/2 border-r-2 border-[#dee2e6]"></div>
                                                    <div className="border-t-2 border-[#dee2e6]"></div>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-[11px] font-bold text-[#adb5bd] whitespace-nowrap">
                                                페이지 {pageIndex + 1}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    id="guide-target-2"
                    onClick={() => {
                        gtag.event({
                            action: "label_add",
                            category: "interaction",
                            label: "Green Plus Button"
                        });
                        addLabel();
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
            </div>

            <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-[#eff6ff] border border-[#dbeafe]/50">
                <div className="flex items-center gap-2">
                    <span className="text-lg opacity-80">📝</span>
                    <div className="text-[14px] font-medium text-[#6b7280]">
                        라벨 {labelData.labelNumber} 편집 중
                    </div>
                </div>
                {labels.length > 1 && (
                    <select
                        value={currentLabelIndex}
                        onChange={(e) => selectLabel(Number(e.target.value))}
                        className="px-2 py-1 bg-white/80 border border-[#dbeafe] rounded-lg text-xs text-[#6b7280] outline-none focus:ring-2 focus:ring-blue-400/50"
                    >
                        {labels.map((label, index) => (
                            <option key={label.id} value={index}>
                                라벨 {label.labelNumber} - {getLabelTitle(label)}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <form className="space-y-2 mt-2" onSubmit={(e) => e.preventDefault()}>
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
                                onClick={() => toggleFieldBold('titleIsBold', labelData.titleIsBold, 'title')}
                                className={`w-12 h-7 border rounded-md font-bold text-sm transition-colors shadow-sm ${labelData.titleIsBold ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                B
                            </button>
                            <div className={`border rounded-md h-7 pr-1 flex items-center transition-colors ${selectedFields['title'] ? 'bg-white border-black ring-1 ring-black' : 'bg-gray-50/50 border-gray-200'}`}>
                                <select
                                    value={selectedFields['title'] && selectionFontSizes['title'] !== undefined ? selectionFontSizes['title'] : (labelData.titleFontSize || 0)}
                                    onChange={(e) => setFieldFontSize('titleFontSize', Number(e.target.value), 'title')}
                                    className={`text-xs bg-transparent focus:outline-none cursor-pointer border-none outline-none appearance-none pl-2 pr-6 h-full w-full ${selectedFields['title'] ? 'text-black font-bold' : 'text-gray-400 font-normal'}`}
                                >
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

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
                                onClick={() => toggleFieldBold('productionYearIsBold', labelData.productionYearIsBold, 'productionYear')}
                                className={`w-12 h-7 border rounded-md font-bold text-sm transition-colors shadow-sm ${labelData.productionYearIsBold ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                B
                            </button>
                            <div className={`border rounded-md h-7 pr-1 flex items-center transition-colors ${selectedFields['productionYear'] ? 'bg-white border-black ring-1 ring-black' : 'bg-gray-50/50 border-gray-200'}`}>
                                <select
                                    value={selectedFields['productionYear'] && selectionFontSizes['productionYear'] !== undefined ? selectionFontSizes['productionYear'] : (labelData.productionYearFontSize || 0)}
                                    onChange={(e) => setFieldFontSize('productionYearFontSize', Number(e.target.value), 'productionYear')}
                                    className={`text-xs bg-transparent focus:outline-none cursor-pointer border-none outline-none appearance-none pl-2 pr-6 h-full w-full ${selectedFields['productionYear'] ? 'text-black font-bold' : 'text-gray-400 font-normal'}`}
                                >
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

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
                                onClick={() => toggleFieldBold('departmentNameIsBold', labelData.departmentNameIsBold, 'departmentName')}
                                className={`w-12 h-7 border rounded-md font-bold text-sm transition-colors shadow-sm ${labelData.departmentNameIsBold ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                                B
                            </button>
                            <div className={`border rounded-md h-7 pr-1 flex items-center transition-colors ${selectedFields['departmentName'] ? 'bg-white border-black ring-1 ring-black' : 'bg-gray-50/50 border-gray-200'}`}>
                                <select
                                    value={selectedFields['departmentName'] && selectionFontSizes['departmentName'] !== undefined ? selectionFontSizes['departmentName'] : (labelData.departmentNameFontSize || 0)}
                                    onChange={(e) => setFieldFontSize('departmentNameFontSize', Number(e.target.value), 'departmentName')}
                                    className={`text-xs bg-transparent focus:outline-none cursor-pointer border-none outline-none appearance-none pl-2 pr-6 h-full w-full ${selectedFields['departmentName'] ? 'text-black font-bold' : 'text-gray-400 font-normal'}`}
                                >
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {recentDepts.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                <span className="text-[10px] text-gray-400 font-medium py-1 pr-1">최근 사용:</span>
                                {recentDepts.map((dept, idx) => (
                                    <button
                                        key={`${dept}-${idx}`}
                                        type="button"
                                        onClick={() => updateLabelData({ departmentName: dept })}
                                        className="px-2.5 py-1 bg-blue-50/50 hover:bg-blue-100/70 text-blue-600 border border-blue-100 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                                    >
                                        {htmlToPlainText(dept)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group">
                        <label className="block text-xs font-medium text-gray-500 mb-1">분류번호</label>
                        <input
                            type="text"
                            value={labelData.classificationCode}
                            onChange={handleInputChange("classificationCode")}
                            placeholder="예: 사업, 회계"
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-[#222222] focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex gap-2 mt-2 transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                            <button
                                type="button"
                                onClick={() => updateLabelData({ classificationCode: "사업" })}
                                className="px-4 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md text-xs font-bold hover:bg-gray-50 shadow-sm transition-all"
                            >
                                사업
                            </button>
                            <button
                                type="button"
                                onClick={() => updateLabelData({ classificationCode: "회계" })}
                                className="px-4 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md text-xs font-bold hover:bg-gray-50 shadow-sm transition-all"
                            >
                                회계
                            </button>
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-medium text-gray-500 mb-1">보존기간</label>
                        <select
                            value={labelData.retentionPeriod}
                            onChange={handleInputChange("retentionPeriod")}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-[#222222] focus:ring-2 focus:ring-blue-500 outline-none"
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
                        <div className="flex gap-2 mt-2 transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                            <button type="button" onClick={() => updateLabelData({ retentionPeriod: "1년" })} className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">1년</button>
                            <button type="button" onClick={() => updateLabelData({ retentionPeriod: "3년" })} className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">3년</button>
                            <button type="button" onClick={() => updateLabelData({ retentionPeriod: "5년" })} className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md text-xs font-bold hover:bg-gray-50 shadow-sm transition-all">5년</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">관리번호</label>
                        <input
                            type="text"
                            value={labelData.managementNumber}
                            onChange={handleInputChange("managementNumber")}
                            placeholder="예: A-001"
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-[#222222] focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            gtag.event({ action: "label_reset", category: "interaction", label: "Reset Button" });
                            resetLabelData();
                        }}
                        className="flex-1 py-3.5 px-4 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                    >
                        초기화
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            gtag.event({ action: "pdf_download", category: "interaction", label: "Download Button" });
                            downloadPDF();
                        }}
                        disabled={isGenerating || !labelData.title || !labelData.productionYear}
                        className="flex-1 py-3.5 px-4 border border-blue-200 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isGenerating ? <span className="animate-spin text-lg">⏳</span> : <span className="text-lg">📄</span>}
                        PDF 다운로드
                    </button>
                    <button
                        type="button"
                        id="guide-target-3"
                        onClick={() => {
                            gtag.event({ action: "label_print", category: "interaction", label: "Print Button" });
                            print();
                        }}
                        disabled={isGenerating || !labelData.title || !labelData.productionYear}
                        className="flex-[1.2] py-3.5 px-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-1.5"
                    >
                        🖨️ 바로 인쇄
                    </button>
                </div>
            </form>
        </div>
    );
}
