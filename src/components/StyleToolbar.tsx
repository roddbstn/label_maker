"use client";

import React from "react";

interface FontToolbarProps {
    currentFontFamily?: string;
    onFontFamilyChange: (font: string) => void;
}

// 한글 지원 폰트 목록 (한글 이름으로 표시)
const KOREAN_FONTS = [
    { name: "프리텐다드", value: "Pretendard Variable" },
    { name: "맑은 고딕", value: "Malgun Gothic" },
    { name: "나눔고딕", value: "NanumGothic" },
    { name: "나눔명조", value: "NanumMyeongjo" },
    { name: "돋움", value: "Dotum" },
    { name: "굴림", value: "Gulim" },
    { name: "바탕", value: "Batang" },
    { name: "본고딕", value: "Noto Sans KR" },
    { name: "본명조", value: "Noto Serif KR" },
];

/**
 * 글꼴 선택 툴바 (전역 설정)
 */
export default function StyleToolbar({
    currentFontFamily,
    onFontFamilyChange,
}: FontToolbarProps) {
    // 현재 폰트에 해당하는 한글 이름 찾기
    const getCurrentFontName = () => {
        const match = KOREAN_FONTS.find(f => f.value === currentFontFamily);
        return match ? match.name : "글꼴 선택";
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            {/* 글꼴 라벨 */}
            <span className="text-sm font-medium text-gray-700">
                🔤 글꼴
            </span>

            {/* 폰트 종류 선택 */}
            <select
                onChange={(e) => onFontFamilyChange(e.target.value)}
                value={currentFontFamily || ""}
                className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] bg-white hover:border-gray-400 cursor-pointer"
                style={{ color: '#222222' }}
            >
                <option value="" disabled>
                    {getCurrentFontName()}
                </option>
                {KOREAN_FONTS.map((font) => (
                    <option
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value, color: '#222222' }}
                    >
                        {font.name}
                    </option>
                ))}
            </select>

            {/* 안내 텍스트 */}
            <span className="text-xs text-gray-400">
                모든 텍스트에 통일 적용됩니다
            </span>
        </div>
    );
}
