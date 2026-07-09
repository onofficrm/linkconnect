import { Lock, Clock, ShieldCheck, PhoneOff } from 'lucide-react';

const badges = [
  { icon: Lock, label: '비밀 상담', desc: '개인정보 보호' },
  { icon: ShieldCheck, label: '무료 진단', desc: '상담비 0원' },
  { icon: PhoneOff, label: '강제 추심 없음', desc: '편안한 상담' },
  { icon: Clock, label: '24시간 내 연락', desc: '빠른 안내' },
];

export default function TrustBadges() {
  return (
    <section className="border-b border-gray-100 bg-white px-4 py-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-bg/60 px-3 py-3 sm:px-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cta/10 text-cta">
              <badge.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-main sm:text-sm">{badge.label}</p>
              <p className="text-[11px] text-gray-500 sm:text-xs">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
