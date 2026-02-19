"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "@/lib/supabaseAuth";

export default function OnboardingPage() {
    const router = useRouter();
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 로그인하지 않은 사용자는 /login으로 리다이렉트
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createAuthClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async () => {
        if (!companyName.trim()) return;
        setLoading(true);
        setError("");

        try {
            const supabase = createAuthClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Supabase Auth 유저 메타데이터에 기관명 저장
            const { error: updateError } = await supabase.auth.updateUser({
                data: { company_name: companyName.trim() }
            });

            if (updateError) {
                setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
                console.error("Auth metadata update error:", JSON.stringify(updateError));
            } else {
                router.push("/");
            }
        } catch {
            setError("오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                {/* 로고 */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <img
                        src="/label_maker_logo.png"
                        alt="라벨 메이커 로고"
                        className="w-10 h-10 rounded-xl"
                    />
                    <span className="text-xl font-bold text-gray-900">라벨 메이커</span>
                </div>

                {/* 환영 메시지 */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    환영합니다! 🎉
                </h1>
                <p className="text-gray-500 mb-10">
                    서비스를 시작하기 위해 기관명을 입력해 주세요.
                </p>

                {/* 기관명 입력 */}
                <div className="text-left mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        기관명 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="예: 서울특별시청, 국세청"
                        autoFocus
                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* 다음 버튼 */}
                <button
                    onClick={handleSubmit}
                    disabled={!companyName.trim() || loading}
                    className={`w-full px-6 py-4 text-base font-bold rounded-2xl transition-all ${companyName.trim()
                        ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 hover:shadow-xl active:scale-95"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {loading ? "저장 중..." : "다음"}
                </button>
            </div>
        </div>
    );
}
