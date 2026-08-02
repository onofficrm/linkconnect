import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";


const pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yevely.kr"),
  title: "모두의철거 | 상가·주택 철거 비교견적",
  description: "상가·학원·주택 철거와 사무실 원상복구, 폐기물 처리까지. 모두의철거에서 검증된 업체 비교견적을 무료로 받아보세요.",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": process.env.NAVER_SITE_VERIFICATION || '',
    }
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "모두의철거 | 상가·주택 철거 비교견적",
    description: "상가·학원·주택 철거와 사무실 원상복구, 폐기물 처리까지. 모두의철거에서 검증된 업체 비교견적을 무료로 받아보세요.",
    url: "/merchant/modemo/",
    siteName: "모두의철거",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "모두의철거 | 상가·주택 철거 비교견적",
    description: "상가·학원·주택 철거와 사무실 원상복구, 폐기물 처리까지. 모두의철거에서 검증된 업체 비교견적을 무료로 받아보세요.",
  },
  alternates: {
    canonical: "/merchant/modemo/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                ${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');` : ''}
              `}
            </Script>
          </>
        )}
      </head>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body
        className={`${pretendard.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
