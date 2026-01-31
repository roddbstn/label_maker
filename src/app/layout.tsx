import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
    title: "라벨 메이커 - 정부문서화일 라벨 자동 생성",
    description:
        "정부문서화일(황대일 파일) 라벨을 웹에서 쉽게 만들고 PDF로 다운로드하세요. 설치 없이 브라우저에서 바로 사용 가능합니다.",
    keywords: [
        "라벨 메이커",
        "정부문서화일",
        "황대일 파일",
        "라벨 출력",
        "PDF 생성",
        "폼텍 3629",
    ],
    openGraph: {
        title: "라벨 메이커 - 정부문서화일 라벨 자동 생성",
        description:
            "입력만 하면 자동으로 예쁘게 맞춰진 라벨 PDF를 받으세요. 설치 없이 무료로 사용 가능!",
        type: "website",
        locale: "ko_KR",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body>
                <Script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-VYPNJMY967"
                />
                <Script id="google-analytics">
                    {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-VYPNJMY967');
            `}
                </Script>
                {children}
            </body>
        </html>
    );
}
