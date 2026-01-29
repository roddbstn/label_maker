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
                            <a
                                href="https://toss.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                ☕ 커피 후원
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 히어로 섹션 */}
                <section className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        정부문서화일 라벨,
                        <br />
                        <span className="text-primary-600">입력만 하면 자동으로 완성</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        장평·자간 조절 노가다 없이, 긴 부서명도 알아서 예쁘게 맞춰드립니다.
                        <br />
                        설치 없이 바로 PDF 다운로드!
                    </p>
                </section>

                {/* 라벨 생성 섹션 */}
                <section className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* 입력 폼 */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                                1
                            </span>
                            라벨 정보 입력
                        </h3>
                        <LabelForm />
                    </div>

                    {/* 미리보기 */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                                2
                            </span>
                            실시간 미리보기
                        </h3>
                        <PreviewSection />
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
