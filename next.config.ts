import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
  // 서버리스 함수가 실행될 때 db 파일을 포함하도록 설정
  output: 'standalone',
  experimental: {
    // 2. Prisma 클라이언트가 서버 런타임에서 외부 패키지로 취급되도록 설정합니다.
    serverExternalPackages: ['@prisma/client'],

    // 3. 타입 오류가 발생한다면 아래와 같이 'as any'를 사용하거나 
    // 최신 구조에 맞춰 경로를 지정합니다.
    outputFileTracingIncludes: {
      '/**/*': ['./prisma/*.db'],
    },
  } as any, // TS 타입 미지원 시 임시 조치
};

export default nextConfig;
