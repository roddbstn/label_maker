import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 브라우저용 Supabase 인증 클라이언트
 */
export function createAuthClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Google 소셜 로그인
 */
export async function signInWithGoogle() {
    const supabase = createAuthClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    return { data, error };
}

/**
 * 이메일/비밀번호 로그인
 */
export async function signInWithEmail(email: string, password: string) {
    const supabase = createAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

/**
 * 회원가입 (이메일 + 비밀번호 + 프로필 정보)
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    metadata: {
        first_name: string;
        last_name: string;
        company_name: string;
    }
) {
    const supabase = createAuthClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
        },
    });
    return { data, error };
}

/**
 * 로그아웃
 */
export async function signOut() {
    const supabase = createAuthClient();
    const { error } = await supabase.auth.signOut();
    return { error };
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
    const supabase = createAuthClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

/**
 * 현재 사용자 가져오기
 */
export async function getUser() {
    const supabase = createAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}
