"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithEmail } from "@/lib/supabaseAuth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleLogin = async () => {
        setError("");
        const { error } = await signInWithGoogle();
        if (error) {
            setError("구글 로그인 중 오류가 발생했습니다.");
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 8) {
            setError("비밀번호는 최소 8자 이상이어야 합니다.");
            setLoading(false);
            return;
        }

        const { error } = await signInWithEmail(email, password);
        if (error) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
            router.push("/app");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* 왼쪽: 로그인 폼 */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <img src="/label_maker_logo.png" alt="로고" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-gray-900">라벨 메이커</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        로그인 ✨
                    </h1>
                    <p className="text-gray-500 mb-8">
                        라벨 메이커에 로그인하고 라벨을 만들어보세요.
                    </p>

                    {/* 구글 로그인 */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google 계정으로 로그인
                    </button>

                    {/* 구분선 */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-slate-400">또는</span>
                        </div>
                    </div>

                    {/* 이메일 로그인 */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                required
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="최소 8자 이상"
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3.5 bg-slate-200 hover:bg-primary-600 hover:text-white text-slate-400 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        계정이 없으신가요?{" "}
                        <Link href="/signup" className="text-primary-600 font-medium hover:underline">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>

            {/* 오른쪽: 서비스 소개 */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 to-primary-50 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full -ml-32 -mb-32"></div>

                <div className="relative z-10 max-w-lg">
                    {/* 서비스 미리보기 모형 */}
                    <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8 transform hover:scale-[1.02] transition-transform duration-500 pointer-events-none select-none">
                        {/* 상단 윈도우 컨트롤 (주소창 제외) */}
                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-200 rounded-full"></div>
                        </div>

                        {/* 간소화된 앱 UI 모형 */}
                        <div className="p-4 bg-[#F8FAFC]">
                            <div className="grid grid-cols-2 gap-4">
                                {/* 좌항: 입력 폼 느낌 */}
                                <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col shadow-sm">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">1</div>
                                        <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                                    </div>

                                    <div className="space-y-2 py-1">
                                        <div className="w-full h-8 bg-slate-50 border border-slate-100 rounded-md p-1.5">
                                            <div className="w-3/4 h-1 bg-slate-200 rounded-full"></div>
                                        </div>
                                        <div className="w-full h-5 bg-slate-50 border border-slate-100 rounded-md p-1.5">
                                            <div className="w-1/2 h-1 bg-slate-200 rounded-full"></div>
                                        </div>
                                        <div className="w-full h-6 bg-slate-50 border border-slate-100 rounded-md p-1.5">
                                            <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mt-auto pt-3">
                                        <div className="flex-1 h-5 bg-slate-100 rounded-md"></div>
                                        <div className="flex-1 h-5 border border-blue-200 rounded-md bg-blue-50/50"></div>
                                        <div className="flex-[1.2] h-5 bg-blue-600 rounded-md"></div>
                                    </div>
                                </div>

                                {/* 우항: 라벨 프리뷰 느낌 */}
                                <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                                    <div className="w-full flex items-center gap-1.5 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">2</div>
                                        <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                                    </div>

                                    {/* 라벨 디자인 압축판 (A4 양식지 느낌) */}
                                    <div className="w-20 h-28 border border-slate-200 rounded-sm bg-white relative flex flex-col p-2 shadow-md scale-90 origin-center">
                                        <div className="flex gap-1.5 mb-2">
                                            <div className="flex-1 aspect-[93/114] border border-slate-300 flex flex-col items-center justify-center">
                                                <div className="w-3/4 h-0.5 bg-slate-800 rounded-full mb-1"></div>
                                                <div className="w-1/2 h-0.5 bg-slate-400 rounded-full"></div>
                                            </div>
                                            <div className="w-3 border border-slate-300 flex flex-col bg-slate-50">
                                                <div className="h-1 border-b border-slate-300"></div>
                                                <div className="h-2 border-b border-slate-300"></div>
                                            </div>
                                        </div>
                                        <div className="w-full h-3 border border-slate-300 mt-auto flex">
                                            <div className="w-4 border-r border-slate-300 bg-slate-50"></div>
                                            <div className="flex-1"></div>
                                        </div>
                                    </div>

                                    <div className="mt-2 w-full h-2 bg-blue-50 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        간편한 라벨 생성
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        정보를 입력하면 실시간으로 미리보기가 업데이트됩니다.<br />
                        폼텍 3629 규격에 맞춰 바로 인쇄할 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
