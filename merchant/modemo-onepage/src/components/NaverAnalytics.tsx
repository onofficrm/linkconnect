'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
const naverCTSId = process.env.NEXT_PUBLIC_NAVER_CTS_ID;

type NaverWcsWindow = Window & {
  wcs_add?: Record<string, string>;
  _nasa?: Record<string, unknown>;
  wcs?: { inflow: (host: string) => void };
  wcs_do?: () => void;
};

export default function NaverAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!naverCTSId) {
    return null;
  }

  // 스크립트 로드 후 초기화 함수
  const initNaverCTS = () => {
    const w = window as NaverWcsWindow;
    if (!w.wcs_add) w.wcs_add = {};
    w.wcs_add['wa'] = naverCTSId;
    if (!w._nasa) w._nasa = {};

    if (w.wcs) {
      w.wcs.inflow('modemo.co.kr');
      w.wcs_do?.();
    }
  };

  // 페이지 이동(라우팅) 시마다 페이지뷰 전송
  useEffect(() => {
    const w = window as NaverWcsWindow;
    if (w.wcs) {
      // url 변경 감지 시 wcs_do() 재실행 (이미 로드된 상태인 경우)
      initNaverCTS();
    }
  }, [pathname, searchParams]);

  return (
    <Script
      id="naver-wcs"
      type="text/javascript"
      src="//wcs.naver.net/wcslog.js"
      strategy="afterInteractive"
      onLoad={initNaverCTS} // 스크립트 다운로드가 완료된 직후 1회 실행
    />
  );
}
