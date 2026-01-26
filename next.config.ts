import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        // 클라이언트 사이드에서 fs 모듈 사용 불가 처리
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                stream: false,
            };
        }
        return config;
    },
};

export default nextConfig;
