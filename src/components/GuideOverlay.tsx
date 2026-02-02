"use client";

import React, { useEffect, useState, useRef } from "react";
import * as gtag from "@/lib/gtag";

interface GuideOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GuideOverlay({ isOpen, onClose }: GuideOverlayProps) {
    const [positions, setPositions] = useState({
        target1: { top: 0, left: 0, width: 0, height: 0 },
        target2: { top: 0, left: 0, width: 0, height: 0 },
        target3: { top: 0, left: 0, width: 0, height: 0 },
    });

    const updatePositions = () => {
        const t1 = document.getElementById("guide-target-1")?.getBoundingClientRect();
        const t2 = document.getElementById("guide-target-2")?.getBoundingClientRect();
        const t3 = document.getElementById("guide-target-3")?.getBoundingClientRect();

        if (t1 || t2 || t3) {
            setPositions({
                target1: t1 ? { top: t1.top, left: t1.left, width: t1.width, height: t1.height } : { top: 0, left: 0, width: 0, height: 0 },
                target2: t2 ? { top: t2.top, left: t2.left, width: t2.width, height: t2.height } : { top: 0, left: 0, width: 0, height: 0 },
                target3: t3 ? { top: t3.top, left: t3.left, width: t3.width, height: t3.height } : { top: 0, left: 0, width: 0, height: 0 },
            });
        }
    };

    useEffect(() => {
        let rafId: number;

        const loop = () => {
            updatePositions();
            rafId = requestAnimationFrame(loop);
        };

        if (isOpen) {
            rafId = requestAnimationFrame(loop);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300 pointer-events-auto cursor-pointer flex items-center justify-center"
            onClick={() => {
                gtag.event({
                    action: "guide_close",
                    category: "interaction",
                    label: "Guide Overlay Backdrop"
                });
                onClose();
            }}
        >
            {/* 중앙 종료 안내 문구 - 배지 스타일로 복구 (흐린 검정) */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] animate-in zoom-in fade-in duration-700 delay-300 pointer-events-none">
                <div className="bg-black/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl">
                    <p className="text-white/90 text-sm font-bold tracking-tight">
                        🏠 홈으로 돌아가려면 화면을 탭하세요
                    </p>
                </div>
            </div>

            {/* Step 1 - Above "라벨 정보 입력" */}
            {positions.target1.width > 0 && (
                <div
                    className="fixed flex flex-col items-center pointer-events-none"
                    style={{
                        top: positions.target1.top - 110,
                        left: positions.target1.left + positions.target1.width / 2 - 130,
                        width: "260px"
                    }}
                >
                    <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 relative animate-in zoom-in slide-in-from-bottom-4 duration-500 text-left items-start flex flex-col">
                        {/* Arrow pointing down */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm border-r border-b border-slate-100"></div>

                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-600 border border-blue-700 text-[10px] font-black text-white mb-2 uppercase tracking-wider relative z-10 shadow-sm">
                            Step 1
                        </div>
                        <div className="text-sm font-bold text-gray-800 leading-snug relative z-10">
                            화일에 붙이는 라벨에 입력할 정보를 입력해주세요.
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2 */}
            {positions.target2.width > 0 && (
                <div
                    className="fixed flex flex-col items-start pointer-events-none"
                    style={{
                        top: positions.target2.top - 110,
                        left: positions.target2.left + positions.target2.width / 2 - 40,
                        width: "260px"
                    }}
                >
                    <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 relative animate-in zoom-in slide-in-from-bottom-4 duration-500 text-left items-start flex flex-col">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-600 border border-green-700 text-[10px] font-black text-white mb-2 uppercase tracking-wider shadow-sm">
                            Step 2
                        </div>
                        <div className="text-sm font-bold text-gray-800 leading-snug">
                            두 개 이상의 라벨을 만드려면 + 버튼을 누르세요.
                        </div>
                        {/* Arrow pointing down */}
                        <div className="absolute -bottom-2 translate-x-1 w-4 h-4 bg-white rotate-45 rounded-sm border-r border-b border-slate-100"></div>
                    </div>
                </div>
            )}

            {/* Step 3 - Above the print button */}
            {positions.target3.width > 0 && (
                <div
                    className="fixed flex flex-col items-center pointer-events-none"
                    style={{
                        top: positions.target3.top - 110,
                        left: positions.target3.left + positions.target3.width / 2 - 120,
                        width: "240px"
                    }}
                >
                    <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 relative animate-in zoom-in slide-in-from-bottom-4 duration-500 text-left items-start flex flex-col">
                        {/* Arrow pointing down */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm border-r border-b border-slate-100"></div>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-600 border border-purple-700 text-[10px] font-black text-white mb-2 uppercase tracking-wider shadow-sm">
                            Step 3
                        </div>
                        <div className="text-sm font-bold text-gray-800 leading-snug">
                            입력을 마쳤나요? 바로 출력!
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
