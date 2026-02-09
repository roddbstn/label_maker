import { getSubmissions } from '@/lib/storage';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const submissions = await getSubmissions();
    const sortedSubmissions = [...submissions].reverse(); // Show latest first

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <AdminDashboard initialSubmissions={sortedSubmissions} />
        </div>
    );
}
