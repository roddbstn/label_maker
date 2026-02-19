import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // 유저 메타데이터에서 기관명(company_name) 확인
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const companyName = user.user_metadata?.company_name;
                // 기관명이 없으면 온보딩 페이지로
                if (!companyName || companyName.trim() === '') {
                    return NextResponse.redirect(`${origin}/onboarding`);
                }
            }
            return NextResponse.redirect(`${origin}/`);
        }
    }

    // 에러 발생 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
