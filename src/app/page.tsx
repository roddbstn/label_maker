"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/supabaseAuth";

export default function LandingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        getSession().then(({ session }) => {
            if (session) setIsLoggedIn(true);
        });
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
            {/* 네비게이션 */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img
                                src="/label_maker_logo.png"
                                alt="라벨 메이커 로고"
                                width={36}
                                height={36}
                                className="w-9 h-9 object-contain rounded-xl"
                            />
                            <span className="text-lg font-bold text-gray-900">라벨 메이커</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={isLoggedIn ? "/app" : "/login"}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                            >
                                로그인
                            </Link>
                            <Link
                                href={isLoggedIn ? "/app" : "/signup"}
                                className="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary-200 hover:shadow-lg hover:shadow-primary-200 active:scale-95"
                            >
                                지금 시작하기
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 히어로 섹션 */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.15]">
                        정부문서화일 라벨,{" "}
                        <br className="hidden sm:block" />
                        <span className="text-primary-600">입력만 하면 자동으로 완성</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        장평·자간 조절 노가다 없이, 긴 부서명도 알아서 예쁘게 맞춰드립니다.
                        <br className="hidden sm:block" />
                        한글 파일 없이 바로 출력!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={isLoggedIn ? "/app" : "/login"}
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-base font-medium rounded-2xl border border-slate-200 transition-all"
                        >
                            로그인
                        </Link>
                        <Link
                            href={isLoggedIn ? "/app" : "/signup"}
                            className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-95"
                        >
                            지금 시작하기
                        </Link>
                    </div>
                </div>
            </section>

            {/* 미리보기 모형 섹션 */}
            <section className="pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-100/50 border border-slate-100 overflow-hidden pointer-events-none select-none">
                        {/* 상단 윈도우 컨트롤 (주소창 제외) */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-2 bg-slate-200 rounded-full"></div>
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            </div>
                        </div>

                        {/* 실제 서비스 UI 모형 */}
                        <div className="p-4 sm:p-8 lg:p-12 bg-[#F8FAFC]">
                            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 max-w-5xl mx-auto">
                                {/* 좌항: 입력 폼 */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                                        <span className="text-sm font-bold text-slate-800">라벨 정보 입력</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100">라벨 1</div>
                                        <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-lg">+</div>
                                    </div>

                                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-2 text-[11px] text-blue-600 font-medium">
                                        📝 라벨 1 편집 중
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-bold text-slate-500">제목 <span className="text-red-500">*</span></div>
                                            <div className="w-full h-16 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-400">
                                                예: 2024년도 아동복지 사업
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-bold text-slate-500">생산연도 <span className="text-red-500">*</span></div>
                                            <div className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 flex items-center text-xs text-slate-700">
                                                2026년
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-bold text-slate-500">부서명</div>
                                            <div className="w-full h-12 bg-white border border-slate-200 rounded-lg px-3 flex items-center text-xs text-slate-700 font-medium">
                                                대전광역시아동보호전문기관
                                            </div>
                                        </div>
                                        {/* 최근 부서명 예시 버튼들 */}
                                        <div className="flex gap-2">
                                            <div className="flex-1 h-9 bg-slate-50 border border-slate-100 rounded-lg"></div>
                                            <div className="flex-1 h-9 bg-slate-50 border border-slate-100 rounded-lg"></div>
                                            <div className="flex-1 h-9 bg-slate-50 border border-slate-100 rounded-lg"></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-6 mt-auto">
                                        <div className="flex-1 h-12 border border-slate-200 rounded-xl flex items-center justify-center text-[12px] font-bold text-slate-700 bg-white">초기화</div>
                                        <div className="flex-1 h-12 border border-blue-200 rounded-xl flex items-center justify-center text-[12px] font-bold text-blue-600 bg-blue-50/30 gap-1.5">
                                            <span className="text-base">📄</span> PDF 다운로드
                                        </div>
                                        <div className="flex-[1.2] h-12 bg-blue-600 rounded-xl shadow-xl shadow-blue-200 flex items-center justify-center text-[12px] font-bold text-white gap-1.5">
                                            <span>🖨️</span> 바로 인쇄
                                        </div>
                                    </div>
                                </div>

                                {/* 우항: 실시간 미리보기 */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center min-h-[500px]">
                                    <div className="w-full flex items-center gap-2 mb-8">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                                        <span className="text-sm font-bold text-slate-800">실시간 미리보기</span>
                                    </div>

                                    {/* 라벨 프리뷰 디자인 (A4 용지 위에 라벨 배치 느낌) */}
                                    <div className="w-full max-w-[340px] aspect-[210/297] bg-white border border-slate-200 shadow-2xl rounded-sm p-3 relative overflow-hidden ring-1 ring-slate-200/50 flex gap-2">
                                        <div className="flex-1 flex flex-col relative border border-slate-100 p-1.5">
                                            {/* 상단 텍스트 영역 */}
                                            <div className="flex-1 flex flex-col items-center justify-center pt-6 pb-10">
                                                <div className="text-[28px] font-bold text-slate-900 mb-6 tracking-[0.2em]">제 목</div>
                                                <div className="text-[20px] font-bold text-slate-800 mb-6">2026년</div>
                                                <div className="text-[12px] font-bold text-slate-700 text-center leading-relaxed">
                                                    대전광역시<br />아동보호전문기관
                                                </div>
                                            </div>

                                            {/* 하단 옆면 라벨 (가로형) - SideClassLabel 양식 */}
                                            <div className="w-full border-[0.5px] border-black mt-auto">
                                                <div className="flex h-7">
                                                    <div className="flex-1 border-r-[0.5px] border-black bg-slate-50 text-[4px] font-bold flex items-center justify-center">분류번호</div>
                                                    <div className="flex-1 border-r-[0.5px] border-black"></div>
                                                    <div className="flex-1 border-r-[0.5px] border-black bg-slate-50 text-[4px] font-bold flex items-center justify-center">생산연도</div>
                                                    <div className="flex-1 border-r-[0.5px] border-black text-[5px] font-bold flex items-center justify-center">2026</div>
                                                    <div className="flex-1 border-r-[0.5px] border-black bg-slate-50 text-[4px] font-bold flex items-center justify-center">보존기간</div>
                                                    <div className="flex-1"></div>
                                                </div>
                                                <div className="flex h-8 border-t-[0.5px] border-black">
                                                    <div className="w-10 border-r-[0.5px] border-black bg-slate-50 flex flex-col items-center justify-center leading-tight">
                                                        <span className="text-[4px] font-bold">제 목</span>
                                                        <span className="text-[3px] font-bold">(보존종료)</span>
                                                    </div>
                                                    <div className="flex-1 text-[6px] font-bold text-slate-400 flex items-center justify-center tracking-widest px-1">
                                                        제목을 입력하세요
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 우측 측면 라벨 (세로형) - EdgeClassLabel 양식 */}
                                        <div className="w-8 border-[0.5px] border-black flex flex-col bg-white">
                                            {/* 관리번호 */}
                                            <div className="h-3 bg-slate-50 border-b-[0.5px] border-black text-[4px] font-bold flex items-center justify-center">관리번호</div>
                                            <div className="h-4 border-b-[0.5px] border-black"></div>

                                            {/* 생산연도 */}
                                            <div className="h-3 bg-slate-50 border-b-[0.5px] border-black text-[4px] font-bold flex items-center justify-center">생산연도</div>
                                            <div className="h-4 border-b-[0.5px] border-black text-[5px] font-bold flex items-center justify-center">2026</div>

                                            {/* 보존기간 */}
                                            <div className="h-3 bg-slate-50 border-b-[0.5px] border-black text-[4px] font-bold flex items-center justify-center">보존기간</div>
                                            <div className="h-4 border-b-[0.5px] border-black"></div>

                                            {/* 분류번호 */}
                                            <div className="h-3 bg-slate-50 border-b-[0.5px] border-black text-[4px] font-bold flex items-center justify-center">분류번호</div>
                                            <div className="h-4 border-b-[0.5px] border-black"></div>

                                            {/* 제목 */}
                                            <div className="h-3 bg-slate-50 border-b-[0.5px] border-black text-[4px] font-bold flex items-center justify-center">제 목</div>
                                            <div className="flex-1 border-b-[0.5px] border-black"></div>

                                            {/* 부서명 */}
                                            <div className="h-3 bg-slate-50 border-b-[0.5px] border-black text-[4px] font-bold flex items-center justify-center">부 서 명</div>
                                            <div className="h-28 flex items-center justify-center p-0.5">
                                                <div className="text-[5px] font-bold text-slate-700 writing-vertical-rl text-center leading-tight">
                                                    대전광역시아동보호전문기관
                                                </div>
                                            </div>
                                        </div>

                                        {/* 배경에 깔리는 점선 가이드 */}
                                        <div className="absolute inset-0 border border-dashed border-slate-100 pointer-events-none -z-10"></div>
                                    </div>

                                    <div className="mt-8 space-y-2 w-full max-w-[340px]">
                                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700 font-bold flex items-center gap-2">
                                            <span className="text-base">📐</span> 폼텍 3629 규격 자동 적용
                                        </div>
                                        <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-600 font-bold flex items-center gap-2">
                                            <span className="text-base">⭐</span> 글꼴 크기가 칸에 맞게 최적화돼요
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 특징 섹션 */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
                        왜 라벨 메이커인가요?
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">자동 텍스트 피팅</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                긴 부서명도 자동으로 폰트 크기와 자간을 조절하여 규격에 맞게 피팅합니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                                <span className="text-2xl">🖨️</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">폼텍 3629 규격</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                바로 출력 가능한 정확한 규격으로 생성됩니다. A4 용지에 바로 인쇄하세요.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                                <span className="text-2xl">✏️</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">글자 크기 상세 수정</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                특정 글자를 선택해서 일부 글자 크기도 간편하게 수정할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA 섹션 */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        지금 바로 시작하세요
                    </h2>
                    <p className="text-gray-500 mb-8">
                        무료로 라벨을 생성하고 출력할 수 있습니다.
                    </p>
                    <Link
                        href={isLoggedIn ? "/app" : "/signup"}
                        className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-95"
                    >
                        지금 시작하기
                    </Link>
                </div>
            </section>

            {/* 푸터 */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-sm text-gray-500">
                        <p className="mb-2">
                            © 2026 라벨 메이커. 무료로 사용하실 수 있습니다.
                        </p>
                        <p>
                            문의:{" "}
                            <a
                                href="https://open.kakao.com/o/sVRBnSdi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:underline"
                            >
                                카카오톡 오픈채팅
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
