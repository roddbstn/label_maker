import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const submissions = getSubmissions();
        return NextResponse.json(submissions);
    } catch (error) {
        console.error('API Error fetching submissions:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
