"use client";

import LabelForm from "@/components/LabelForm";
import PreviewSection from "@/components/PreviewSection";
import GuideOverlay from "@/components/GuideOverlay";
import { useState, useEffect } from "react";
import { submitWaitlistAction, submitFeedbackAction } from '@/lib/actions';
import * as gtag from "@/lib/gtag";

export default function Home() {
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    // 이탈(Exit) 트래킹
    useEffect(() => {
        const handleExit = () => {
            gtag.event({
                action: "page_exit",
                category: "engagement",
                label: "User Left Page"
            });
        };

        window.addEventListener("beforeunload", handleExit);
        return () => {
            window.removeEventListener("beforeunload", handleExit);
        };
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* 헤더 */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/label_maker_logo.png"
                                alt="라벨 메이커 - 정부문서화일 라벨 자동 생성기 로고"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain rounded-xl shadow-sm"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    라벨 메이커
                                    <span className="sr-only">: 정부문서화일 라벨 자동 생성기</span>
                                </h1>
                                <p className="text-xs text-gray-500">정부문서화일 라벨 자동 생성</p>
                            </div>
                        </div>
                        <nav className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    gtag.event({
                                        action: "guide_view",
                                        category: "interaction",
                                        label: "Header Guide Button"
                                    });
                                    setIsGuideOpen(true);
                                }}
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                            >
                                사용 가이드
                            </button>
                            <button
                                onClick={() => {
                                    gtag.event({
                                        action: "waitlist_cta_click",
                                        category: "interaction",
                                        label: "Header Waitlist Button"
                                    });
                                    document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-primary-100 hover:scale-105 active:scale-95"
                            >
                                🔔 정식 버전 알림받기
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* 라벨 생성 섹션 */}
                <section className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* 입력 폼 */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-8 flex flex-col h-full">
                        <h3 id="guide-target-1" className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                                1
                            </span>
                            라벨 정보 입력
                        </h3>
                        <div className="flex-1">
                            <LabelForm />
                        </div>
                    </div>

                    {/* 미리보기 */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:px-8 lg:pt-8 lg:pb-4 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                                2
                            </span>
                            실시간 미리보기
                        </h3>
                        <div className="flex-1">
                            <PreviewSection />
                        </div>
                    </div>
                </section>

                {/* 히어로 섹션 - 콤팩트 버전 (하단 배치) */}
                <section className="text-center py-16 md:py-24 relative border-t border-slate-100 mt-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                        정부문서화일 라벨, <br className="sm:hidden" />
                        <span className="text-primary-600">입력만 하면 자동으로 완성</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        장평·자간 조절 노가다 없이, 긴 부서명도 알아서 예쁘게 맞춰드립니다. <br className="hidden sm:block" />
                        한글 파일 없이 바로 출력!
                    </p>
                </section>

                {/* 특징 섹션 - 가로형으로 더 콤팩트하게 */}
                <section className="mt-12 grid sm:grid-cols-3 gap-4">
                    <div className="bg-white/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <span className="text-xl">✨</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg">자동 텍스트 피팅</h4>
                            <p className="text-sm text-gray-500">긴 부서명도 자동 조절</p>
                        </div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <span className="text-xl">🖨️</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg">폼텍 3629 규격</h4>
                            <p className="text-sm text-gray-500">바로 출력 가능한 정확한 규격</p>
                        </div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <span className="text-xl">💻</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg">설치 불필요</h4>
                            <p className="text-sm text-gray-500">브라우저에서 바로 사용</p>
                        </div>
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8 items-start mt-24">
                    {/* 정식 버전 알림받기 CTA (Eden 스타일 - 콤팩트 버전) */}
                    <section id="waitlist-section" className="relative group h-full">
                        <div className="absolute -inset-3 bg-gradient-to-r from-slate-100 to-blue-50/50 rounded-[3rem] blur-xl opacity-40 transition duration-1000 group-hover:opacity-60"></div>

                        <div className="relative h-full bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 sm:p-12 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden text-center flex flex-col items-center justify-center">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 opacity-40"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/20 rounded-full -ml-24 -mb-24 opacity-40"></div>

                            <div className="relative z-10 w-full">
                                <div className="mx-auto w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-slate-100 transition-transform duration-500 group-hover:scale-110">
                                    <span className="text-xl">⚡</span>
                                </div>

                                <div className="inline-block px-3 py-1 bg-slate-100/80 rounded-full text-[9px] font-black tracking-[0.2em] text-slate-500 mb-4 uppercase">
                                    Join the waitlist
                                </div>

                                <h3 className="text-2xl sm:text-2xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
                                    정식 버전 알림 받기
                                </h3>

                                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed opacity-80 max-w-xs mx-auto">
                                    베타 종료 후 출시될 정식 버전의<br /> 출시 알림과 혜택을 보내드립니다.
                                </p>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);

                                        gtag.event({
                                            action: "waitlist_submit",
                                            category: "conversion",
                                            label: "Waitlist Form"
                                        });

                                        const result = await submitWaitlistAction(formData);
                                        if (result.success) {
                                            alert('반갑습니다! 정식 버전 출시 소식을 보내드릴게요.');
                                            (e.target as HTMLFormElement).reset();
                                        } else {
                                            alert(result.error || '오류가 발생했습니다.');
                                        }
                                    }}
                                    className="space-y-3 max-w-xs mx-auto"
                                >
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="이메일 주소"
                                        className="w-full px-6 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#222222] text-white text-sm font-black rounded-xl hover:bg-[#333333] transition-all shadow-lg shadow-slate-100 active:scale-[0.98] tracking-wide"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 opacity-70">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                        소식 받기
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>

                    {/* 피드백 섹션 (Eden 스타일 - 콤팩트 버전) */}
                    <section className="relative group h-full">
                        <div className="absolute -inset-3 bg-gradient-to-r from-slate-100 to-blue-50/30 rounded-[3rem] blur-xl opacity-30 transition duration-1000 group-hover:opacity-50"></div>

                        <div className="relative h-full bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 sm:p-12 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden text-center flex flex-col items-center justify-center">
                            <div className="absolute top-0 left-0 w-48 h-48 bg-slate-50 rounded-full -ml-24 -mt-24 opacity-40"></div>

                            <div className="relative z-10 w-full">
                                <div className="mx-auto w-12 h-12 bg-[#222222] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-slate-100">
                                    <span className="text-xl">💬</span>
                                </div>

                                <div className="inline-block px-3 py-1 bg-slate-100/80 rounded-full text-[9px] font-black tracking-[0.2em] text-slate-500 mb-4 uppercase">
                                    Share your thoughts
                                </div>

                                <h3 className="text-2xl sm:text-2xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
                                    불편한 점은 없었나요?
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed opacity-80 max-w-xs mx-auto">
                                    기능 제안, 버그 제보 등 어떤 의견이라도<br /> 편하게 들려주세요.
                                </p>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);

                                        gtag.event({
                                            action: "feedback_submit",
                                            category: "engagement",
                                            label: "Feedback Form"
                                        });

                                        const result = await submitFeedbackAction(formData);
                                        if (result.success) {
                                            alert('소중한 피드백 감사합니다! 개발에 적극 반영하겠습니다.');
                                            (e.target as HTMLFormElement).reset();
                                        } else {
                                            alert(result.error || '오류가 발생했습니다.');
                                        }
                                    }}
                                    className="space-y-3 max-w-xs mx-auto"
                                >
                                    <textarea
                                        name="feedback"
                                        required
                                        placeholder="익명으로 의견 남기기"
                                        rows={2}
                                        className="w-full px-6 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none shadow-inner"
                                    />
                                    <input
                                        type="text"
                                        name="organization"
                                        required
                                        placeholder="본인 기관명 (회사명)"
                                        className="w-full px-6 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#222222] text-white text-sm font-black rounded-xl hover:bg-[#333333] transition-all active:scale-[0.98] shadow-lg shadow-slate-100"
                                    >
                                        의견 보내기
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* 푸터 */}
            <footer className="mt-20 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-sm text-gray-500">
                        <p className="mb-2">
                            © 2026 라벨 메이커. 무료로 사용하실 수 있습니다.
                        </p>
                        <p>
                            문의: <a href="https://open.kakao.com/o/sVRBnSdi" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">카카오톡 오픈채팅</a>
                        </p>
                    </div>
                </div>
            </footer>

            <GuideOverlay isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </main>
    );
}
