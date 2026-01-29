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
                <section id="waitlist-section" className="mt-20 bg-gradient-to-br from-primary-600 to-blue-800 rounded-3xl p-8 sm:p-16 text-center text-white shadow-2xl shadow-primary-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="max-w-2xl mx-auto relative z-10">
                        <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-widest mb-6 border border-white/30">
                            BETA VERSION
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-bold mb-6 leading-tight">🚀 정식 버전 출시 알림을<br className="hidden sm:block" /> 가장 먼저 받아보세요</h3>
                        <p className="text-blue-100/90 text-lg mb-10 font-medium">
                            베타 서비스 종료 후 더 강력해진 자동화 기능과<br /> 다양한 양식으로 돌아올 정식 버전의 소식을 알려드립니다.
                        </p>
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('소중한 의견 감사합니다! 정식 버전 출시 소식도 이메일로 보내드리겠습니다.');
                            }}
                        >
                            <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                                <input
                                    type="email"
                                    required
                                    placeholder="이메일 주소를 입력해주세요"
                                    className="flex-1 px-6 py-4 rounded-xl bg-transparent text-white placeholder:text-blue-100/50 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                                >
                                    소식 받기
                                </button>
                            </div>

                            <div className="text-left mt-24 flex flex-col gap-8">
                                <div className="p-8 sm:p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl relative">
                                    <div className="absolute -top-6 left-10 px-6 py-2 bg-sky-500 text-white text-xs font-black tracking-widest rounded-full shadow-lg">
                                        FEEDBACK
                                    </div>

                                    <label className="block text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                                        💬 불편한 점은 없었나요?
                                    </label>
                                    <p className="text-sky-200/80 mb-8 text-base sm:text-xl font-bold leading-relaxed max-w-xl">
                                        사소한 의견이라도 남겨주시면 정식 버전 개발에<br className="hidden sm:block" /> 큰 힘이 됩니다. 여러분의 목소리를 들려주세요!
                                    </p>

                                    <textarea
                                        placeholder="예: 이런 양식도 추가해주세요, 글자 조절이 더 세밀했으면 좋겠어요 등"
                                        rows={4}
                                        className="w-full px-8 py-6 text-lg rounded-3xl bg-blue-900/40 border-2 border-white/10 text-white placeholder:text-blue-200/20 focus:outline-none focus:ring-4 focus:ring-sky-400/30 transition-all resize-none shadow-inner"
                                    />
                                </div>
                            </div>
                        </form>
                        <p className="mt-6 text-[11px] text-blue-200/60 flex items-center justify-center gap-1.5 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            입력해주신 메일 정보와 소중한 피드백은 정식 버전 개발 목적으로만 안전하게 사용됩니다.
                        </p>
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
