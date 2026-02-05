"use client";

import React from "react";
import { useLabelStore } from "@/store/labelStore";
import Formtec3629Preview from "./Formtec3629Preview";

/**
 * 인쇄 시 모든 라벨을 렌더링하기 위한 숨겨진 컨테이너
 * - ID: "print-all-container"
 * - 화면에는 보이지 않지만 DOM에는 존재하여 글자 크기 자동 조절 등이 실시간으로 수행됨
 */
export default function PrintAllContainer() {
    const { labels } = useLabelStore();

    // 2개당 1페이지
    const totalPages = Math.ceil(labels.length / 2);
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
        <div
            id="print-all-container"
            className="fixed left-[-9999px] top-[-9999px]"
            style={{ width: '210mm' }}
        >
            {pages.map((pageIndex) => (
                <div key={pageIndex} className="print-page-wrapper">
                    <Formtec3629Preview currentPage={pageIndex} />
                </div>
            ))}
        </div>
    );
}
