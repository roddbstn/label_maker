"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface RichTextInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    onSelectionChange?: (hasSelection: boolean, rect: DOMRect | null, fontSize?: number) => void;
    minHeight?: string;
}

/**
 * contentEditable 기반 리치 텍스트 입력 컴포넌트
 * - Shift+Enter: 줄바꿈 (<br>)
 * - Enter: 기본 동작 방지
 * - 텍스트 선택 감지
 */
export default function RichTextInput({
    id,
    value,
    onChange,
    placeholder = "",
    className = "",
    required = false,
    onSelectionChange,
    minHeight = "48px",
}: RichTextInputProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInternalChange = useRef(false);

    // 외부 value 변경 시 에디터 업데이트
    useEffect(() => {
        if (editorRef.current && !isInternalChange.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || "";
            }
        }
        isInternalChange.current = false;
    }, [value]);

    // 내부 변경 핸들러
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // 키보드 이벤트 핸들러
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                // Shift+Enter: 줄바꿈 (insertLineBreak가 가장 표준적임)
                e.preventDefault();
                document.execCommand("insertLineBreak");
                // handleInput()을 직접 호출하지 않아도 execCommand가 input 이벤트를 발생시킴
            } else {
                // Enter만: 기본 동작 방지
                e.preventDefault();
            }
        }
    }, []); // handleInput 제거하여 불필요한 재생성 방지

    // 선택 변경 감지
    const handleSelectionChange = useCallback(() => {
        if (!onSelectionChange) return;

        const selection = window.getSelection();
        const editor = editorRef.current;

        // 1. 선택이 없거나 붕괴된 경우 (커서만 있는 경우)
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            onSelectionChange(false, null);
            return;
        }

        // 2. 선택 영역이 현재 에디터 내부에 있는지 확인
        const range = selection.getRangeAt(0);
        const isSelectionInEditor = editor?.contains(range.commonAncestorContainer);

        if (isSelectionInEditor) {
            const rect = range.getBoundingClientRect();

            // 폰트 크기 감지
            let detectedFontSize: number | undefined;
            const node = selection.anchorNode;
            const parentElement = node?.nodeType === 3 ? node.parentElement : node as HTMLElement;

            if (parentElement) {
                const findPtInStyle = (el: HTMLElement): number | undefined => {
                    const style = el.getAttribute('style');
                    if (style) {
                        const match = style.match(/font-size:\s*(\d+(\.\d+)?)pt/i);
                        if (match) return parseFloat(match[1]);
                    }
                    return el.parentElement && editor?.contains(el.parentElement)
                        ? findPtInStyle(el.parentElement)
                        : undefined;
                };
                detectedFontSize = findPtInStyle(parentElement);

                if (detectedFontSize === undefined) {
                    const style = window.getComputedStyle(parentElement);
                    detectedFontSize = Math.round(parseFloat(style.fontSize) * 0.75);
                }
            }

            onSelectionChange(true, rect, detectedFontSize);
        } else {
            // 다른 에디터나 다른 곳을 선택한 경우
            onSelectionChange(false, null);
        }
    }, [onSelectionChange]);

    // 선택 이벤트 리스너 등록
    useEffect(() => {
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, [handleSelectionChange]);

    // 스타일 적용 함수 (외부에서 호출 가능)
    const applyStyle = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleInput();
        editorRef.current?.focus();
    }, [handleInput]);

    // ref를 통해 applyStyle 노출
    useEffect(() => {
        if (editorRef.current) {
            (editorRef.current as any).applyStyle = applyStyle;
        }
    }, [applyStyle]);

    return (
        <div className="relative">
            <div
                ref={editorRef}
                id={id}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={handleInput}
                className={`input-field break-words ${className}`}
                style={{ minHeight }}
                data-placeholder={placeholder}
                role="textbox"
                aria-required={required}
                aria-multiline="true"
                suppressContentEditableWarning
            />
            {/* Placeholder 스타일링 */}
            <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
}

// 스타일 적용을 위한 유틸리티 함수 export
export function applyTextStyle(
    editorElement: HTMLElement | null,
    command: "bold" | "fontSize" | "fontName",
    value?: string
) {
    if (!editorElement) return;

    // 에디터에 포커스
    editorElement.focus();

    if (command === "bold") {
        document.execCommand("bold", false);
        // 에디터의 input 이벤트를 강제로 발생시켜 상태 업데이트
        const event = new Event('input', { bubbles: true });
        editorElement.dispatchEvent(event);
    } else if (command === "fontSize") {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editorElement.contains(selection.anchorNode)) {
            const fontSize = value || "0";

            // value가 "0"이면 폰트 크기 태그 제거 (기본으로 복구)
            if (fontSize === "0") {
                document.execCommand("removeFormat", false);
            } else {
                // fontSize 명령 실행 (pt 단위로 직접 주입하기 위해 임시 태그 사용)
                document.execCommand("fontSize", false, "7");
                const fontElements = editorElement.querySelectorAll('font[size="7"]');
                fontElements.forEach(font => {
                    const span = document.createElement('span');
                    span.style.fontSize = `${fontSize}pt`;
                    span.setAttribute('data-size', fontSize === "36" ? "medium" : fontSize === "24" ? "small" : "custom");
                    while (font.firstChild) {
                        span.appendChild(font.firstChild);
                    }
                    font.parentNode?.replaceChild(span, font);
                });
            }

            // 에디터의 input 이벤트를 강제로 발생시켜 상태 업데이트
            const event = new Event('input', { bubbles: true });
            editorElement.dispatchEvent(event);
        }
    } else if (command === "fontName") {
        document.execCommand("fontName", false, value);
        const event = new Event('input', { bubbles: true });
        editorElement.dispatchEvent(event);
    }
}
