import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // /app, /onboarding 접근 시 로그인 필요
    if (
        (request.nextUrl.pathname.startsWith('/app') ||
            request.nextUrl.pathname === '/onboarding' ||
            request.nextUrl.pathname === '/settings') &&
        !user
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // 로그인/회원가입 페이지: 이미 로그인된 사용자는 /app으로 리다이렉트
    if (
        (request.nextUrl.pathname === '/login' ||
            request.nextUrl.pathname === '/signup') &&
        user
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/app';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: ['/app/:path*', '/login', '/signup', '/onboarding', '/settings'],
};
