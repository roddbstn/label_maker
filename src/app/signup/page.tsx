"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signUpWithEmail } from "@/lib/supabaseAuth";

export default function SignupPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleSignup = async () => {
        setError("");
        const { error } = await signInWithGoogle();
        if (error) {
            setError("구글 로그인 중 오류가 발생했습니다.");
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 8) {
            setError("비밀번호는 최소 8자 이상이어야 합니다.");
            setLoading(false);
            return;
        }

        const { error } = await signUpWithEmail(email, password, {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
        });

        if (error) {
            if (error.message.includes("already registered")) {
                setError("이미 가입된 이메일입니다. 로그인해 주세요.");
            } else {
                setError("회원가입 중 오류가 발생했습니다: " + error.message);
            }
        } else {
            router.push("/app");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* 왼쪽: 회원가입 폼 */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <img src="/label_maker_logo.png" alt="로고" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-gray-900">라벨 메이커</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        회원가입 ✨
                    </h1>
                    <p className="text-gray-500 mb-8">
                        라벨 메이커를 시작해보세요. 무료입니다.
                    </p>

                    {/* 회원가입 폼 */}
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">성</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="성"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="이름"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">기관명</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="기관명 (회사명)"
                                required
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
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
                            {loading ? "가입 중..." : "회원가입"}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-slate-400">또는</span>
                        </div>
                    </div>

                    {/* 구글 회원가입 */}
                    <button
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google 계정으로 가입
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        이미 계정이 있으신가요?{" "}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>

            {/* 오른쪽: 서비스 소개 */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 to-primary-50 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full -ml-32 -mb-32"></div>

                <div className="relative z-10 max-w-lg">
                    {/* 브라우저 모형 */}
                    <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">✨</div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">자동 텍스트 피팅</div>
                                        <div className="text-xs text-gray-500">긴 부서명도 자동 조절</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🖨️</div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">폼텍 3629 규격</div>
                                        <div className="text-xs text-gray-500">바로 출력 가능한 정확한 규격</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">✏️</div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">글자 크기 상세 수정</div>
                                        <div className="text-xs text-gray-500">특정 글자 크기도 간편하게 수정</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        라벨 메이커의 주요 기능
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
