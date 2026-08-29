import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";


const pretendard = localFont({
  src: [
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
  ],
  variable: "--font-pretendard",
  display: "swap",
  preload: true,
});

const SITE_TITLE = "철거 업체";
const SITE_DESCRIPTION =
  "철거 업체 모두의철거에서 상가, 사무실, 주택, 공장 등 다양한 공간의 철거 서비스를 알아보세요. 현장 상황에 맞춰 철거 범위와 작업 방법을 확인하고, 원상복구 및 폐기물 처리까지 편리하게 진행할 수 있습니다. 전문 철거업체를 통해 안전하고 체계적인 철거 작업을 상담받아보세요.";

export const metadata: Metadata = {
  metadataBase: new URL("https://yevely.kr"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": process.env.NAVER_SITE_VERIFICATION || '',
    }
  },
  icons: {
    // Cafe24 핫링크 회피: merchant-static 프록시 (yevely Referer 403 방지)
    icon: [
      {
        url: "/plugin/linkconnect/api/merchant-static.php?m=modemo&p=favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        url: "/plugin/linkconnect/api/merchant-static.php?m=modemo&p=favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/plugin/linkconnect/api/merchant-static.php?m=modemo&p=favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/plugin/linkconnect/api/merchant-static.php?m=modemo&p=apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/merchant/modemo/",
    siteName: "모두의철거",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
    <html lang="ko">
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
