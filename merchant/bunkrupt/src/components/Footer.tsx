export default function Footer() {
  return (
    <footer className="bg-main px-4 py-10 text-center text-gray-400 sm:pb-12 sm:pt-14 pb-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap justify-center gap-4 text-[13px] font-medium text-gray-300">
          <a href="#" className="hover:text-white" onClick={(e) => e.preventDefault()}>개인정보처리방침</a>
          <span className="text-gray-600">|</span>
          <a href="#" className="hover:text-white" onClick={(e) => e.preventDefault()}>상담안내</a>
          <span className="text-gray-600">|</span>
          <a href="#" className="hover:text-white" onClick={(e) => e.preventDefault()}>광고/상담 유의사항</a>
        </div>
        
        <div className="mx-auto max-w-3xl text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
          <p className="mb-2">
            본 페이지는 개인회생 상담 신청을 위한 안내 페이지이며, 실제 진행 가능 여부는 신청자의 채무, 소득, 재산, 부양가족, 최근 대출 내역 등에 따라 달라질 수 있습니다.
          </p>
          <p className="mb-6">
            상담 신청은 개인회생 가능성을 검토하기 위한 절차이며, 상담 결과에 따라 진행이 어려울 수 있습니다.
          </p>
          <p>
            모든 개인정보는 관련 법령에 따라 안전하게 보호되며, 본래의 목적 외에는 사용되지 않습니다.
          </p>
        </div>
        
        <div className="mt-8 border-t border-white/10 pt-6 text-[12px]">
          <p>&copy; {new Date().getFullYear()} 개인회생 자격진단 센터. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
