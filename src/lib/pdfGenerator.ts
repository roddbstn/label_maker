import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { LabelData } from "@/types";

/**
 * A4 규격 (mm)
 */
const A4_SIZE = {
    width: 210,
    height: 297,
};

/**
 * HTML에서 순수 텍스트 추출 (파일명용)
 */
function htmlToPlainText(html: string): string {
    if (!html) return "";
    let text = html.replace(/<br\s*\/?>/gi, " ");
    text = text.replace(/<[^>]*>/g, "");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value.trim();
}

/**
 * 미리보기 요소를 캔버스로 캡처
 */
async function capturePreview(): Promise<HTMLCanvasElement | null> {
    const previewElement = document.getElementById("formtec-3629-preview");

    if (!previewElement) {
        console.error("폼텍 3629 미리보기 요소를 찾을 수 없습니다.");
        alert("미리보기 요소를 찾을 수 없습니다. 양식 미리보기 탭을 선택해주세요.");
        return null;
    }

    try {
        // 캡처 전에 잠시 대기하여 모든 렌더링이 완료되도록 함
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(previewElement, {
            scale: 3,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            allowTaint: true,
        });
        return canvas;
    } catch (error) {
        console.error("캡처 오류:", error);
        throw error;
    }
}

/**
 * 라벨 PDF 생성 및 다운로드
 */
export async function generateLabelPDF(labels: LabelData | LabelData[]): Promise<void> {
    const labelArray = Array.isArray(labels) ? labels : [labels];
    const labelData = labelArray[0];

    if (!labelData) {
        console.error("라벨 데이터가 없습니다.");
        return;
    }

    const canvas = await capturePreview();
    if (!canvas) return;

    try {
        // PDF 생성 (A4 사이즈)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // 캔버스를 A4 비율에 맞게 조정
        const imgWidth = A4_SIZE.width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 이미지 추가
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        // 파일명 생성 (특수문자 제거)
        const titlePlain = htmlToPlainText(labelData.title) || "라벨";
        const safeTitle = titlePlain
            .replace(/[^가-힣a-zA-Z0-9]/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 20);
        const fileName = `폼텍3629_${safeTitle}_${labelData.productionYear || "미정"}.pdf`;

        // PDF를 Blob으로 생성 후 다운로드
        const pdfBlob = doc.output("blob");
        const url = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // URL 해제
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error("PDF 생성 중 오류:", error);
        throw error;
    }
}

/**
 * 바로 인쇄 기능
 * 미리보기 DOM을 그대로 복제하여 인쇄 (100% 미리보기 일치 보장)
 */
export async function printLabel(): Promise<void> {
    const previewElement = document.getElementById("formtec-3629-preview");

    if (!previewElement) {
        console.error("폼텍 3629 미리보기 요소를 찾을 수 없습니다.");
        alert("미리보기 요소를 찾을 수 없습니다. 양식 미리보기 탭을 선택해주세요.");
        return;
    }

    try {
        // 기존 인쇄용 iframe 제거
        const existingFrame = document.getElementById("print-iframe");
        if (existingFrame) {
            existingFrame.remove();
        }

        // 숨겨진 iframe 생성
        const iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            alert("인쇄 준비 중 오류가 발생했습니다.");
            return;
        }

        // 현재 페이지의 모든 스타일시트 수집
        const styles = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch {
                    return '';
                }
            })
            .join('\n');

        // 현재 페이지의 link 태그들 (Google Fonts 등)
        const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map(link => link.outerHTML)
            .join('\n');

        // 미리보기 요소 복제 (깊은 복제)
        const clonedPreview = previewElement.cloneNode(true) as HTMLElement;

        // UI 전용 스타일 제거 (그림자, 테두리, 마진 등)
        clonedPreview.classList.remove('shadow-xl', 'mx-auto');
        clonedPreview.style.boxShadow = 'none';
        clonedPreview.style.border = 'none';
        clonedPreview.style.outline = 'none';
        clonedPreview.style.margin = '0';
        clonedPreview.style.position = 'absolute';
        clonedPreview.style.top = '0';
        clonedPreview.style.left = '0';

        // 모든 computed styles를 인라인으로 적용
        const applyComputedStyles = (original: Element, clone: Element) => {
            if (original instanceof HTMLElement && clone instanceof HTMLElement) {
                const computed = window.getComputedStyle(original);
                const importantStyles = [
                    'font-family', 'font-size', 'font-weight', 'font-style',
                    'color', 'background-color', 'background',
                    'border', 'border-width', 'border-style', 'border-color',
                    'border-top', 'border-right', 'border-bottom', 'border-left',
                    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                    'display', 'position', 'top', 'right', 'bottom', 'left',
                    'transform', 'transform-origin',
                    'text-align', 'vertical-align', 'line-height', 'letter-spacing',
                    'white-space', 'word-break', 'overflow', 'text-overflow',
                    'writing-mode', 'box-sizing', 'flex', 'flex-direction', 'justify-content', 'align-items',
                    'border-radius', 'opacity',
                ];

                importantStyles.forEach(prop => {
                    const value = computed.getPropertyValue(prop);
                    if (value) {
                        clone.style.setProperty(prop, value);
                    }
                });
            }

            const originalChildren = original.children;
            const cloneChildren = clone.children;
            for (let i = 0; i < originalChildren.length; i++) {
                if (cloneChildren[i]) {
                    applyComputedStyles(originalChildren[i], cloneChildren[i]);
                }
            }
        };

        applyComputedStyles(previewElement, clonedPreview);

        // 복제된 요소에 대해 다시 한번 UI 스타일 제거 (computed style 적용 과정에서 다시 붙었을 수 있음)
        clonedPreview.style.boxShadow = 'none';
        clonedPreview.style.border = 'none';
        clonedPreview.style.outline = 'none';
        clonedPreview.style.margin = '0';
        clonedPreview.style.position = 'absolute';
        clonedPreview.style.top = '0';
        clonedPreview.style.left = '0';

        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>폼텍 3629 라벨 인쇄</title>
                ${linkTags}
                <style>
                    ${styles}
                    
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        background-color: white;
                        overflow: hidden;
                    }
                    #print-content {
                        width: 210mm;
                        height: 297mm;
                        position: relative;
                        background: white;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body>
                <div id="print-content"></div>
            </body>
            </html>
        `);
        iframeDoc.close();

        // 원본 요소의 크기 측정
        const originalWidth = previewElement.offsetWidth;
        const originalHeight = previewElement.offsetHeight;

        // A4 크기 (픽셀, 96dpi 기준: 210mm = 793.7px, 297mm = 1122.5px)
        const a4WidthPx = 793.7;
        const a4HeightPx = 1122.5;

        // 스케일 계산 (A4에 맞추기)
        const scaleX = a4WidthPx / originalWidth;
        const scaleY = a4HeightPx / originalHeight;
        const scale = Math.min(scaleX, scaleY); // 비율 유지

        // 복제된 요소에 스케일 적용
        clonedPreview.style.transformOrigin = 'top left';
        clonedPreview.style.transform = `scale(${scale})`;
        clonedPreview.style.width = `${originalWidth}px`;
        clonedPreview.style.height = `${originalHeight}px`;

        // 복제된 요소를 iframe에 삽입
        const printContent = iframeDoc.getElementById("print-content");
        if (printContent) {
            printContent.appendChild(clonedPreview);
        }

        // 폰트 로딩 대기 후 인쇄
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }, 500);

    } catch (error) {
        console.error("인쇄 준비 중 오류:", error);
        alert("인쇄 준비 중 오류가 발생했습니다.");
    }
}




