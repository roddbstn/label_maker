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

    // ===== 면별 오버라이드 (없으면 기본값 사용) =====
    /** 측면용 제목 HTML 오버라이드 */
    titleSide?: string;
    /** 옆면용 제목 HTML 오버라이드 */
    titleEdge?: string;
    /** 옆면용 부서명 HTML 오버라이드 */
    departmentNameEdge?: string;

    /** 측면용 제목 글자 크기 오버라이드 */
    titleFontSizeSide?: number;
    /** 옆면용 제목 글자 크기 오버라이드 */
    titleFontSizeEdge?: number;
    /** 옆면용 부서명 글자 크기 오버라이드 */
    departmentNameFontSizeEdge?: number;

    /** 옆면 분류번호에서 부서명 칸 숨기기 */
    hideDepartmentOnEdge?: boolean;
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
    resetLabelData: (initialData?: Partial<LabelData>) => void;
    /** 모든 라벨 초기화 */
    resetAllLabels: () => void;
    /** 라벨 추가 */
    addLabel: (initialData?: Partial<LabelData>) => void;
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

    /** 라벨 세트 1 (상단) - '스티커 칸' 기준 좌표 */
    set1: {
        title: { x: 18.6, y: 237.5, width: 123, height: 36.5, paddingX: 0, paddingY: 0 },
        year: { x: 18.6, y: 214, width: 63.5, height: 23.5, paddingX: 0, paddingY: 0 },
        department: { x: 18.6, y: 184, width: 84.5, height: 30, paddingX: 0, paddingY: 0 },
        sideClass: { x: 18.6, y: 151, width: 93, height: 28, paddingX: 2.25, paddingY: 1.75 },
    },

    /** 라벨 세트 2 (하단) - '스티커 칸' 기준 좌표 */
    set2: {
        title: { x: 18.6, y: 104.5, width: 123, height: 36.5, paddingX: 0, paddingY: 0 },
        year: { x: 18.6, y: 81, width: 63.5, height: 23.5, paddingX: 0, paddingY: 0 },
        department: { x: 18.6, y: 51, width: 84.5, height: 30, paddingX: 0, paddingY: 0 },
        sideClass: { x: 18.6, y: 18, width: 93, height: 28, paddingX: 2.25, paddingY: 1.75 },
    },

    /** 옆면 분류번호 라벨 (세로) - '스티커 칸' 기준 좌표 */
    edge1: { x: 153.6, y: 18, width: 16, height: 256, paddingX: 1.75, paddingY: 1.5 },
    edge2: { x: 175.6, y: 18, width: 16, height: 256, paddingX: 1.75, paddingY: 1.5 },

    /** 측면 분류번호 내부 구조 */
    sideClassInternal: {
        padding: 0,
        topRow: { height: 12.25, cellWidth: 14.75 }, // (24.5/2)
        bottomRow: { height: 12.25, titleWidth: 22.5, valueWidth: 66.0 },
    },

    /** 옆면 분류번호 내부 구조 */
    edgeInternal: {
        paddingX: 0,
        paddingY: 0,
        innerWidth: 12.5,
        rows: [
            { label: "관리번호", height: 6.0 },
            { label: "value", height: 11.0 },
            { label: "생산연도", height: 6.0 },
            { label: "value", height: 11.0 },
            { label: "보존기간", height: 6.0 },
            { label: "value", height: 11.0 },
            { label: "분류번호", height: 6.0 },
            { label: "value", height: 11.0 },
            { label: "제목", height: 6.0 },
            { label: "value", height: 102.0 }, // 253 - 151 = 102
            { label: "부 서 명", height: 6.0 },
            { label: "value", height: 71.0 },  // 253 - (17*4 + 108 + 6) = 71
        ],
    },
} as const;
