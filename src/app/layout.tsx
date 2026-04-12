/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "포치타 | 시험기간 딴짓 기록 앱",
  description: "시험기간의 딴짓 시간을 기록하고, 통계와 랭킹으로 돌아보게 해주는 서비스",
  keywords: "포치타, 딴짓, 시험기간, 타이머, 집중, 통계, 랭킹",
  openGraph: {
    title: "포치타 | 시험기간 딴짓 기록 앱",
    description: "시험기간의 딴짓 시간을 기록하고, 통계와 랭킹으로 돌아보게 해주는 서비스",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="max-w-[430px] mx-auto relative">{children}</body>
    </html>
  );
}
