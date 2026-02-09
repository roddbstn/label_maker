import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// CORS headers for cross-origin requests from admin-app
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    const origin = request.headers.get('origin');
    console.log(`[API] Submissions request from origin: ${origin}`);

    try {
        const submissions = await getSubmissions();
        console.log(`[API] Successfully fetched ${submissions.length} submissions`);
        return NextResponse.json(submissions, { headers: corsHeaders });
    } catch (error) {
        console.error('[API Error] Fetching submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500, headers: corsHeaders }
        );
    }
}
