'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
const naverCTSId = process.env.NEXT_PUBLIC_NAVER_CTS_ID;


export default function NaverAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 스크립트 로드 후 초기화 함수
  const initNaverCTS = () => {
    if (!window.wcs_add) window.wcs_add = {};
    window.wcs_add['wa'] = naverCTSId;
    if (!window._nasa) window._nasa = {};

    if (window.wcs) {
      window.wcs.inflow('modemo.co.kr');
      window.wcs_do();
    }
  };

  // 페이지 이동(라우팅) 시마다 페이지뷰 전송
  useEffect(() => {
    if (window.wcs) {
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
