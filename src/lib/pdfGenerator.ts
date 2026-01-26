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
 * 모든 스타일을 인라인으로 적용하여 인쇄 (100% 미리보기 일치 보장)
 */
export async function printLabel(): Promise<void> {
    const previewElement = document.getElementById("formtec-3629-preview");

    if (!previewElement) {
        console.error("폼텍 3629 미리보기 요소를 찾을 수 없습니다.");
        alert("미리보기 요소를 찾을 수 없습니다. 양식 미리보기 탭을 선택해주세요.");
        return;
    }

    try {
        // 인쇄용 새 창 생성
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("팝업이 차단되었습니다. 팝업을 허용해주세요.");
            return;
        }

        // 프리뷰 HTML 복제 및 모든 스타일 인라인 적용
        const previewClone = previewElement.cloneNode(true) as HTMLElement;

        // 재귀적으로 모든 요소에 computed style 적용
        function applyComputedStyles(source: Element, target: Element) {
            const computedStyle = window.getComputedStyle(source);
            const targetElement = target as HTMLElement;

            // 중요한 CSS 속성들을 인라인으로 적용
            const importantProperties = [
                'display', 'flex-direction', 'justify-content', 'align-items',
                'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
                'margin', 'padding', 'border', 'border-radius',
                'background', 'background-color',
                'color', 'font-family', 'font-size', 'font-weight', 'line-height',
                'text-align', 'vertical-align', 'white-space', 'letter-spacing',
                'writing-mode', 'text-orientation',
                'position', 'top', 'right', 'bottom', 'left',
                'overflow', 'box-sizing', 'transform', 'transform-origin',
                'border-top', 'border-right', 'border-bottom', 'border-left',
                'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'gap'
            ];

            importantProperties.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
                    targetElement.style.setProperty(prop, value);
                }
            });

            // 자식 요소들에도 재귀적으로 적용
            const sourceChildren = source.children;
            const targetChildren = target.children;
            for (let i = 0; i < sourceChildren.length; i++) {
                if (targetChildren[i]) {
                    applyComputedStyles(sourceChildren[i], targetChildren[i]);
                }
            }
        }

        applyComputedStyles(previewElement, previewClone);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>폼텍 3629 라벨 인쇄</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        background-color: white;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .print-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: white;
                        transform: scale(1.5);
                        transform-origin: center center;
                    }
                    @media print {
                        html, body {
                            width: 210mm;
                            height: 297mm;
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${previewClone.outerHTML}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();

        // 렌더링 완료 후 인쇄
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 300);
    } catch (error) {
        console.error("인쇄 준비 중 오류:", error);
        alert("인쇄 준비 중 오류가 발생했습니다.");
    }
}


