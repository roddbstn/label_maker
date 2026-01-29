/** 라벨 데이터 타입 정의 */
export interface LabelData {
    /** 라벨 고유 ID */
    id: string;
    /** 라벨 번호 (삭제해도 변경되지 않음) */
    labelNumber: number;
    /** 제목 (필수) - HTML 포함 가능 */
    title: string;
    /** 생산연도 (필수) */
    productionYear: string;
    /** 부서명 - HTML 포함 가능 */
    departmentName: string;
    /** 분류번호 */
    classificationCode: string;
    /** 보존기간 */
    retentionPeriod: string;
    /** 관리번호 */
    managementNumber: string;

    // ===== 스타일 설정 =====
    /** 전역 글꼴 */
    fontFamily?: string;

    /** 제목 스타일 */
    titleFontSize?: number;
    titleIsBold?: boolean;

    /** 생산연도 스타일 */
    productionYearFontSize?: number;
    productionYearIsBold?: boolean;

    /** 부서명 스타일 */
    departmentNameFontSize?: number;
    departmentNameIsBold?: boolean;
}

/** 히스토리 레코드 (저장 시간 포함) */
export interface HistoryRecord {
    id: string;
    savedAt: string;
    labelData: LabelData;
}

/** 텍스트 스타일 설정 */
export interface TextStyle {
    fontSize: number; // px 단위
    fontFamily: string; // 'Pretendard' | 'Noto Sans KR' 등
    isBold: boolean;
}

/** 지원하는 리치 텍스트 필드 */
export type RichTextField = "title" | "departmentName";

/** Supabase document_labels 테이블 타입 */
export interface DocumentLabel {
    id: number;
    created_at: string;
    batch_id: string;
    title: string;
    production_year: string;
    department_name: string | null;
    classification_code: string | null;
    retention_period: string | null;
    management_number: string | null;
}

/** PDF 생성 옵션 */
export interface PDFGenerationOptions {
    /** 라벨 규격 (기본: 폼텍 3629) */
    labelFormat: "formtec-3629";
    /** 포함할 라벨 종류 */
    includedLabels: {
        cover: boolean;
        side: boolean;
        internal: boolean;
    };
}

/** 라벨 스토어 상태 타입 */
export interface LabelStoreState {
    /** 모든 라벨 데이터 배열 */
    labels: LabelData[];
    /** 현재 편집 중인 라벨 인덱스 */
    currentLabelIndex: number;
    /** 다음 라벨에 할당할 번호 */
    nextLabelNumber: number;
    /** PDF 생성 중 여부 */
    isGenerating: boolean;
    /** 히스토리 목록 */
    history: HistoryRecord[];
    /** 현재 라벨 데이터 (편의용 getter) */
    labelData: LabelData;
    /** 라벨 데이터 업데이트 */
    updateLabelData: (data: Partial<LabelData>) => void;
    /** 현재 라벨 초기화 */
    resetLabelData: () => void;
    /** 모든 라벨 초기화 */
    resetAllLabels: () => void;
    /** 라벨 추가 */
    addLabel: () => void;
    /** 라벨 삭제 */
    removeLabel: (id: string) => void;
    /** 라벨 선택 */
    selectLabel: (index: number) => void;
    /** PDF 다운로드 */
    downloadPDF: () => Promise<void>;
    /** 바로 인쇄 */
    print: () => Promise<void>;
    /** 히스토리 저장 */
    saveToHistory: () => void;
    /** 히스토리에서 불러오기 */
    loadFromHistory: (id: string) => void;
    /** 히스토리 삭제 */
    deleteFromHistory: (id: string) => void;
}

/** 폼텍 3629 라벨 좌표 상수 (mm 단위, A4 기준 좌하단 원점) */
export const FORMTEC_3629_COORDS = {
    /** A4 용지 크기 */
    page: { width: 210, height: 297 },

    /** 라벨 세트 1 (상단) */
    set1: {
        title: { x: 17.6, y: 240.5, width: 123, height: 36.5 },       // Left 17.6, Top 20 (297-20-36.5)
        year: { x: 18.35, y: 216.5, width: 63.5, height: 23.5 },      // Gap adjusted for 20mm margins
        department: { x: 18.35, y: 187.0, width: 84.5, height: 30 },  // Gap adjusted
        sideClass: { x: 19.1, y: 151.0, width: 91, height: 26 },      // Gap adjusted
    },

    /** 라벨 세트 2 (하단) */
    set2: {
        title: { x: 17.6, y: 109.5, width: 123, height: 36.5 },       // Left 17.6
        year: { x: 18.35, y: 85.5, width: 63.5, height: 23.5 },       // Gap adjusted
        department: { x: 18.35, y: 56.0, width: 84.5, height: 30 },   // Gap adjusted
        sideClass: { x: 19.1, y: 20.0, width: 91, height: 26 },       // Bottom 20
    },

    /** 옆면 분류번호 라벨 (세로) - A4 여백 보정 (Right 17.7mm) */
    edge1: { x: 153.1, y: 21.5, width: 14, height: 254 },             // Centered vertically
    edge2: { x: 178.3, y: 21.5, width: 14, height: 254 },             // Right margin: 210-(178.3+14) = 17.7

    /** 측면 분류번호 내부 구조 */
    sideClassInternal: {
        padding: 0,
        topRow: { height: 13.5, cellWidth: 15.5 },
        bottomRow: { height: 13.5, titleWidth: 22.5, valueWidth: 66.5 },
    },

    /** 옆면 분류번호 내부 구조 */
    edgeInternal: {
        paddingX: 1,  // 2mm에서 1mm로 축소
        paddingY: 0,
        innerWidth: 12, // 14mm - 2mm 패딩 = 12mm
        rows: [
            { label: "관리번호", height: 6.0 },  // 7.5 -> 6.0
            { label: "value", height: 11.0 },   // 14.0 -> 11.0
            { label: "생산연도", height: 6.0 },  // 7.5 -> 6.0
            { label: "value", height: 11.0 },   // 14.0 -> 11.0
            { label: "보존기간", height: 6.0 },  // 7.5 -> 6.0
            { label: "value", height: 11.0 },   // 14.0 -> 11.0
            { label: "분류번호", height: 6.0 },  // 7.5 -> 6.0
            { label: "value", height: 11.0 },   // 14.0 -> 11.0
            { label: "제목", height: 6.0 },      // 7.5 -> 6.0
            { label: "value", height: 104.0 },  // 90 -> 104.0 (축소분 반영)
            { label: "부서명", height: 6.0 },
            { label: "value", height: 74.0 },   // 62 -> 74.0 (축소분 반영)
        ],
    },
} as const;
