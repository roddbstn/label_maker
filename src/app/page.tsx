"use client";

import LabelForm from "@/components/LabelForm";
import PreviewSection from "@/components/PreviewSection";

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* 헤더 */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/label_maker_logo.png"
                                alt="라벨 메이커 로고"
                                className="w-10 h-10 object-contain rounded-xl shadow-sm"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">라벨 메이커</h1>
                                <p className="text-xs text-gray-500">정부문서화일 라벨 자동 생성</p>
                            </div>
                        </div>
                        <nav className="flex items-center gap-4">
                            <a href="#guide" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                사용 가이드
                            </a>
                            <button
                                onClick={() => {
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 히어로 섹션 */}
                <section className="text-center mb-12 relative">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        정부문서화일 라벨,
                        <br />
                        <span className="text-primary-600">입력만 하면 자동으로 완성</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        장평·자간 조절 노가다 없이, 긴 부서명도 알아서 예쁘게 맞춰드립니다.
                        <br />
                        설치 없이 바로 PDF 다운로드!
                    </p>

                </section>

                {/* 라벨 생성 섹션 */}
                <section className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* 입력 폼 */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-8 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
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
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-8 flex flex-col h-full">
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

                {/* 특징 섹션 */}
                <section className="mt-16 grid sm:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">자동 텍스트 피팅</h4>
                        <p className="text-sm text-gray-600">
                            긴 부서명도 자동으로 크기 조절
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🖨️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">폼텍 3629 규격</h4>
                        <p className="text-sm text-gray-600">
                            바로 출력 가능한 정확한 규격
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💻</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">설치 불필요</h4>
                        <p className="text-sm text-gray-600">
                            웹 브라우저에서 바로 사용
                        </p>
                    </div>
                </section>

                {/* 정식 버전 알림받기 CTA */}
                <section id="waitlist-section" className="mt-20 max-w-4xl mx-auto bg-gradient-to-br from-primary-600 to-blue-800 rounded-[2.5rem] p-8 sm:p-12 text-left text-white shadow-2xl shadow-primary-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-widest mb-6 border border-white/30">
                            BETA VERSION
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-bold mb-6 leading-tight">🚀 정식 버전 출시 알림을<br className="hidden sm:block" /> 가장 먼저 받아보세요</h3>
                        <p className="text-blue-100/90 text-lg mb-10 font-medium">
                            베타 서비스 종료 후 더 강력해진 자동화 기능과<br /> 다양한 양식으로 돌아올 정식 버전의 소식을 알려드립니다.
                        </p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('감사합니다! 정식 버전 출시 소식을 이메일로 보내드리겠습니다.');
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="email"
                                required
                                placeholder="이메일 주소를 입력해주세요"
                                className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-blue-100/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-xl"
                            />
                            <button
                                type="submit"
                                className="px-10 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                            >
                                소식 받기
                            </button>
                        </form>

                        <p className="mt-6 text-[11px] text-blue-100/60 flex items-center justify-start gap-1.5 font-medium ml-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            메일 주소는 정식 버전 알림 목적으로만 안전하게 보호됩니다.
                        </p>
                    </div>
                </section>

                {/* 피드백 섹션 (흰색 박스 디자인) */}
                <section className="mt-8 max-w-4xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="flex h-3 w-3 rounded-full bg-primary-500"></span>
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Feedback</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                💬 불편한 점은 없었나요?
                            </h3>
                            <p className="text-gray-500 mb-8 text-sm sm:text-base leading-relaxed">
                                사용 중 느끼신 사소한 의견이라도 남겨주세요. <br className="hidden sm:block" />
                                여러분의 한마디가 더 나은 서비스를 만드는 데 큰 힘이 됩니다.
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert('소중한 피드백 감사합니다! 개발에 적극 반영하겠습니다.');
                                }}
                                className="space-y-4"
                            >
                                <textarea
                                    placeholder="자유롭게 어떤 의견이든 남겨주세요 (익명 전달)"
                                    rows={4}
                                    className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    의견 보내기
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </div>

            {/* 푸터 */}
            <footer className="mt-20 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-sm text-gray-500">
                        <p className="mb-2">
                            © 2026 라벨 메이커. 무료로 사용하실 수 있습니다.
                        </p>
                        <p>
                            문의: <a href="mailto:contact@labelmaker.kr" className="text-primary-600 hover:underline">contact@labelmaker.kr</a>
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
