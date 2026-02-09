import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase 클라이언트 (브라우저용)
 * - document_labels 테이블 CRUD
 * - 비회원 batch_id 기반 데이터 관리
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase 어드민 클라이언트 (서버용)
 * - RLS를 우회하여 데이터베이스 작업 수행
 */
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : supabase; // Fallback to anon if secret key is missing


/**
 * 새 batch_id 생성
 * 비회원 사용자 식별을 위한 UUID
 */
export function generateBatchId(): string {
    return crypto.randomUUID();
}

/**
 * LocalStorage에서 batch_id 가져오기 또는 새로 생성
 */
export function getOrCreateBatchId(): string {
    if (typeof window === "undefined") {
        return generateBatchId();
    }

    const stored = localStorage.getItem("label-maker-batch-id");
    if (stored) {
        return stored;
    }

    const newId = generateBatchId();
    localStorage.setItem("label-maker-batch-id", newId);
    return newId;
}
