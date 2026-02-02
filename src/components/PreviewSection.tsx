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
        <div className="space-y-2">
            {/* 미리보기 */}
            <LabelPreview autoFitText={autoFitText} />

            {/* 옵션 - 글자 크기 자동 조절 안내 (하단 이동) */}
            <div className="flex items-center gap-2 p-2.5 bg-blue-50/40 rounded-lg border border-blue-100/40">
                <span className="text-xs">⭐</span>
                <span className="text-xs text-blue-700/80 font-medium">
                    글꼴 크기가 칸에 맞게 최적화돼요
                </span>
            </div>
        </div>
    );
}
