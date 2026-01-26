"use client";

import { useState } from "react";
import LabelPreview from "./LabelPreview";

/**
 * 미리보기 래퍼 컴포넌트
 * - autoFitText 체크박스 UI 포함
 * - LabelPreview에 옵션 전달
 */
export default function PreviewSection() {
    const [autoFitText, setAutoFitText] = useState(true);

    return (
        <div className="space-y-4">
            {/* 옵션 - 글자 크기 자동 조절 */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                    type="checkbox"
                    id="autoFitText"
                    checked={autoFitText}
                    onChange={(e) => setAutoFitText(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label
                    htmlFor="autoFitText"
                    className="text-sm text-gray-700 cursor-pointer select-none"
                >
                    ✨ 글자 크기 칸 크기에 최적화하기
                </label>
            </div>

            {/* 미리보기 */}
            <LabelPreview autoFitText={autoFitText} />
        </div>
    );
}
