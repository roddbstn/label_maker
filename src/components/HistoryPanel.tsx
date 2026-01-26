"use client";

import { useLabelStore, getHistoryDisplayInfo } from "@/store/labelStore";

/**
 * 이전 출력 기록 패널
 * - LocalStorage에 저장된 히스토리 목록 표시
 * - 클릭 시 해당 데이터 로드
 * - 삭제 기능
 */
export default function HistoryPanel() {
    const { history, loadFromHistory, deleteFromHistory } = useLabelStore();

    if (history.length === 0) {
        return (
            <div className="text-sm text-gray-400 text-center py-4">
                저장된 기록이 없습니다.
                <br />
                PDF 다운로드 시 자동으로 저장됩니다.
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((record) => {
                const { title, year, dateStr } = getHistoryDisplayInfo(record);

                return (
                    <div
                        key={record.id}
                        className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => loadFromHistory(record.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {title}
                            </p>
                            <p className="text-xs text-gray-500">
                                {year && `${year} · `}{dateStr}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteFromHistory(record.id);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="삭제"
                        >
                            ✕
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
