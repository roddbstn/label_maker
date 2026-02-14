import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://labelmaker.kr"),
    title: {
        default: "라벨 메이커 - 정부문서화일 라벨 자동 생성",
        template: "%s | 라벨 메이커"
    },
    description:
        "정부문서화일(황대일 파일) 라벨을 웹에서 쉽게 만들고 PDF로 다운로드하세요. 폼텍 3629 규격 완벽 지원. 설치 없이 무료로 바로 사용 가능한 라벨 자동 생성기입니다.",
    keywords: [
        "라벨 메이커",
        "라벨 생성기",
        "정부문서화일 라벨",
        "황대일 파일 라벨",
        "화일 라벨 출력",
        "PDF 라벨 생성",
        "폼텍 3629",
        "공공기관 라벨",
    ],
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "라벨 메이커 - 정부문서화일 라벨 자동 생성",
        description:
            "입력만 하면 자동으로 예쁘게 맞춰진 라벨 PDF를 받으세요. 폼텍 3629 규격 지원, 설치 없이 무료 사용!",
        url: "https://labelmaker.kr",
        siteName: "라벨 메이커",
        type: "website",
        locale: "ko_KR",
        images: [
            {
                url: "/label_maker_logo.png",
                width: 398,
                height: 398,
                alt: "라벨 메이커 - 정부문서화일 라벨 자동 생성",
            },
        ],
    },
    icons: {
        icon: "/label_maker_logo.png",
        apple: "/label_maker_logo.png",
    },
    verification: {
        google: "google-site-verification-placeholder", // 사용자가 나중에 채울 수 있도록
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" style={{ colorScheme: 'light' }}>
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
