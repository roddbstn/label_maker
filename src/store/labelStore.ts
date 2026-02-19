"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LabelData, LabelStoreState, HistoryRecord } from "@/types";
import { generateLabelPDF, printLabel } from "@/lib/pdfGenerator";

/** 새 라벨 생성 */
function createNewLabel(labelNumber: number): LabelData {
    return {
        id: crypto.randomUUID(),
        labelNumber,
        title: "",
        productionYear: "2026년",
        departmentName: "",
        classificationCode: "",
        retentionPeriod: "",
        managementNumber: "",
        // 기본 스타일
        fontFamily: "Pretendard Variable",
        titleFontSize: undefined, // undefined이면 자동 피팅
        titleIsBold: false,
        productionYearFontSize: undefined,
        productionYearIsBold: false,
        departmentNameFontSize: undefined,
        departmentNameIsBold: false,
    };
}

/** HTML에서 순수 텍스트 추출 (표시용) */
function htmlToPlainText(html: string): string {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .trim();
}

/**
 * 라벨 상태 관리 스토어
 * - 다중 라벨 입력 관리
 * - LocalStorage 영속화 (입력 기록 저장)
 * - 히스토리 관리
 * - PDF 생성 호출
 */
export const useLabelStore = create<LabelStoreState>()(
    persist(
        (set, get) => ({
            labels: [createNewLabel(1)],
            currentLabelIndex: 0,
            nextLabelNumber: 2, // 다음 라벨은 2번부터 시작
            isGenerating: false,
            history: [],

            // 현재 라벨 데이터 getter (편의용)
            get labelData() {
                const state = get();
                return state.labels[state.currentLabelIndex] || createNewLabel(0);
            },

            updateLabelData: (data) =>
                set((state) => {
                    const updatedLabels = [...state.labels];
                    updatedLabels[state.currentLabelIndex] = {
                        ...updatedLabels[state.currentLabelIndex],
                        ...data,
                    };
                    return { labels: updatedLabels };
                }),

            resetLabelData: (initialData) =>
                set((state) => {
                    const updatedLabels = [...state.labels];
                    const currentLabel = updatedLabels[state.currentLabelIndex];
                    updatedLabels[state.currentLabelIndex] = {
                        ...createNewLabel(currentLabel.labelNumber),
                        ...initialData,
                        id: currentLabel.id,
                    };
                    return { labels: updatedLabels };
                }),

            resetAllLabels: () =>
                set({
                    labels: [createNewLabel(1)],
                    currentLabelIndex: 0,
                    nextLabelNumber: 2,
                }),

            addLabel: (initialData) =>
                set((state) => {
                    const newLabel = {
                        ...createNewLabel(state.nextLabelNumber),
                        ...initialData
                    };
                    return {
                        labels: [...state.labels, newLabel],
                        currentLabelIndex: state.labels.length,
                        nextLabelNumber: state.nextLabelNumber + 1,
                    };
                }),

            removeLabel: (id: string) =>
                set((state) => {
                    // 최소 1개는 유지
                    if (state.labels.length <= 1) return state;

                    // 라벨 삭제 후 남은 라벨들의 번호를 1부터 다시 순서대로 부여
                    const remainingLabels = state.labels
                        .filter((l) => l.id !== id)
                        .map((label, index) => ({
                            ...label,
                            labelNumber: index + 1
                        }));

                    const newIndex = Math.min(
                        state.currentLabelIndex,
                        remainingLabels.length - 1
                    );

                    return {
                        labels: remainingLabels,
                        currentLabelIndex: newIndex,
                        nextLabelNumber: remainingLabels.length + 1
                    };
                }),

            selectLabel: (index: number) =>
                set((state) => ({
                    currentLabelIndex: Math.max(
                        0,
                        Math.min(index, state.labels.length - 1)
                    ),
                })),

            downloadPDF: async () => {
                const { labels, saveToHistory } = get();

                // 모든 라벨 중 하나라도 필수값이 있는지 확인
                const validLabels = labels.filter(
                    (l) => l.title || l.productionYear
                );
                if (validLabels.length === 0) {
                    alert("최소 하나의 라벨에 제목 또는 생산연도를 입력해주세요.");
                    return;
                }

                set({ isGenerating: true });

                try {
                    await generateLabelPDF(labels);
                    // PDF 다운로드 후 히스토리에 자동 저장
                    saveToHistory();
                } catch (error) {
                    console.error("PDF 생성 실패:", error);
                    alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
                } finally {
                    set({ isGenerating: false });
                }
            },

            print: async () => {
                const { labels } = get();

                // 모든 라벨 중 하나라도 필수값이 있는지 확인
                const validLabels = labels.filter(
                    (l) => l.title || l.productionYear
                );
                if (validLabels.length === 0) {
                    alert("최소 하나의 라벨에 제목 또는 생산연도를 입력해주세요.");
                    return;
                }

                set({ isGenerating: true });

                try {
                    await printLabel();
                } catch (error) {
                    console.error("인쇄 실패:", error);
                    alert("인쇄 준비 중 오류가 발생했습니다. 다시 시도해주세요.");
                } finally {
                    set({ isGenerating: false });
                }
            },

            saveToHistory: () => {
                const { labels, history } = get();
                const currentLabel = labels[0]; // 첫 번째 라벨 기준

                // 빈 데이터는 저장하지 않음
                if (!currentLabel.title && !currentLabel.productionYear) return;

                const newRecord: HistoryRecord = {
                    id: crypto.randomUUID(),
                    savedAt: new Date().toISOString(),
                    labelData: { ...currentLabel },
                };

                // 최대 20개까지 저장 (오래된 것부터 삭제)
                const updatedHistory = [newRecord, ...history].slice(0, 20);

                set({ history: updatedHistory });
            },

            loadFromHistory: (id: string) => {
                const { history } = get();
                const record = history.find((r) => r.id === id);
                if (record) {
                    set((state) => {
                        const updatedLabels = [...state.labels];
                        updatedLabels[state.currentLabelIndex] = {
                            ...record.labelData,
                            id: updatedLabels[state.currentLabelIndex].id,
                        };
                        return { labels: updatedLabels };
                    });
                }
            },

            deleteFromHistory: (id: string) => {
                const { history } = get();
                set({ history: history.filter((r) => r.id !== id) });
            },
        }),
        {
            name: "label-maker-storage-v2",
            partialize: (state) => ({
                labels: state.labels,
                currentLabelIndex: state.currentLabelIndex,
                nextLabelNumber: state.nextLabelNumber,
                history: state.history,
            }),
        }
    )
);

/** 히스토리 레코드 표시용 정보 생성 */
export function getHistoryDisplayInfo(record: HistoryRecord) {
    const title = htmlToPlainText(record.labelData.title) || "(제목 없음)";
    const year = record.labelData.productionYear || "";
    const savedAt = new Date(record.savedAt);
    const dateStr = savedAt.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return {
        title: title.length > 20 ? title.slice(0, 20) + "..." : title,
        year,
        dateStr,
    };
}
