import { getSubmissions } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const submissions = getSubmissions().reverse(); // Show latest first

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">사용자 문의 및 피드백 내역</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Total: {submissions.length}</span>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-bottom border-slate-200">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">날짜</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">구분</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">이메일 / 피드백</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">기관명</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            {new Date(sub.createdAt).toLocaleString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-md ${sub.type === 'waitlist'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {sub.type === 'waitlist' ? '알림신청' : '피드백'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900 max-w-md">
                                            {sub.type === 'waitlist' ? sub.email : (
                                                <div className="whitespace-pre-wrap">{sub.feedback}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {sub.organization || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
