"use client";

import React, { useState } from "react";

export default function AdminPage() {
    // 임시 데이터 (실제로는 API를 통해 DB에서 가져와야 함)
    const [emails, setEmails] = useState([
        { id: 1, email: "tester1@example.com", date: "2026-01-29 14:20" },
        { id: 2, email: "user_a@gmail.com", date: "2026-01-29 15:45" },
        { id: 3, email: "office_worker@naver.com", date: "2026-01-29 16:10" },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 ">관리자 대시보드</h1>
                        <p className="text-sm text-gray-500 mt-1">정식 버전 알림 신청자 리스트</p>
                    </div>
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                        총 {emails.length}명
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">신청 일시</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {emails.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {emails.length === 0 && (
                        <div className="py-20 text-center text-gray-400">
                            신청자가 아직 없습니다.
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        리스트 인쇄
                    </button>
                    <button
                        onClick={() => alert('CSV로 내보내기 기능은 준비 중입니다.')}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-md shadow-primary-100"
                    >
                        CSV 내보내기
                    </button>
                </div>
            </div>
        </div>
    );
}
