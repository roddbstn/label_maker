import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // 라벨 메이커 브랜드 컬러
                primary: {
                    50: "#f0f7ff",
                    100: "#e0effe",
                    200: "#bae0fd",
                    300: "#7cc8fb",
                    400: "#36aaf6",
                    500: "#0c8ee7",
                    600: "#0070c5",
                    700: "#0159a0",
                    800: "#064b84",
                    900: "#0b3f6e",
                    950: "#072849",
                },
                secondary: {
                    50: "#f5f7fa",
                    100: "#eaeef4",
                    200: "#d0dbe7",
                    300: "#a7bdd2",
                    400: "#779ab8",
                    500: "#567da0",
                    600: "#436485",
                    700: "#37516c",
                    800: "#30455b",
                    900: "#2c3c4d",
                    950: "#1d2733",
                },
            },
            fontFamily: {
                sans: ["Pretendard", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
