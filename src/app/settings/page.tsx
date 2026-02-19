"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "@/lib/supabaseAuth";
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // 편집 필드
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");

    // 원본 값 (변경 감지용)
    const [originalFirstName, setOriginalFirstName] = useState("");
    const [originalLastName, setOriginalLastName] = useState("");
    const [originalCompanyName, setOriginalCompanyName] = useState("");

    const avatarUrl = user?.user_metadata?.avatar_url;

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createAuthClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const meta = user.user_metadata || {};
            const fn = meta.first_name || meta.full_name?.split(" ")[0] || "";
            const ln = meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || "";
            const cn = meta.company_name || "";

            setFirstName(fn);
            setLastName(ln);
            setCompanyName(cn);
            setOriginalFirstName(fn);
            setOriginalLastName(ln);
            setOriginalCompanyName(cn);
            setLoading(false);
        };
        fetchUser();
    }, [router]);

    const hasChanges =
        firstName !== originalFirstName ||
        lastName !== originalLastName ||
        companyName !== originalCompanyName;

    const isValid =
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        companyName.trim().length > 0;

    const handleSave = async () => {
        if (!hasChanges || !isValid) return;
        setSaving(true);
        setMessage("");

        try {
            const supabase = createAuthClient();
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    company_name: companyName.trim(),
                },
            });

            if (error) {
                setMessage("저장 중 오류가 발생했습니다.");
                console.error("Settings save error:", error);
            } else {
                setMessage("저장되었습니다.");
                setOriginalFirstName(firstName.trim());
                setOriginalLastName(lastName.trim());
                setOriginalCompanyName(companyName.trim());
                setTimeout(() => setMessage(""), 2000);
            }
        } catch {
            setMessage("오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-gray-400">불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* 헤더 */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <img
                                src="/label_maker_logo.png"
                                alt="라벨 메이커 로고"
                                className="w-10 h-10 object-contain rounded-xl shadow-sm"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">라벨 메이커</h1>
                            </div>
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            돌아가기
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* 왼쪽 사이드바 */}
                    <nav className="w-56 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium flex items-center gap-2.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                프로필 정보 수정
                            </button>
                        </div>
                    </nav>

                    {/* 오른쪽 메인 */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-8">프로필 정보 수정</h2>

                            {/* 프로필 이미지 */}
                            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="프로필"
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">프로필 이미지</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {avatarUrl ? "Google 계정에서 가져온 이미지입니다." : "기본 프로필 이미지를 사용 중입니다."}
                                    </p>
                                </div>
                            </div>

                            {/* 편집 필드들 */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">성</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="성"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="이름"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">기관명 (부서명)</label>
                                        <span className="text-xs text-gray-400">Shift + Enter로 줄바꿈 가능</span>
                                    </div>
                                    <textarea
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="예: 서울특별시청, 국세청"
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다.</p>
                                </div>
                            </div>

                            {/* 저장 버튼 + 메시지 */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    {message && (
                                        <p className={`text-sm ${message.includes("오류") ? "text-red-500" : "text-green-600"}`}>
                                            {message}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges || !isValid || saving}
                                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${hasChanges && isValid
                                        ? "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-100 active:scale-95"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    {saving ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
