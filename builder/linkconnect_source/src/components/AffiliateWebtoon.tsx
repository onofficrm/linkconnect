import { BookOpen, ChevronDown } from 'lucide-react';

type CharacterId = 'owner' | 'partner' | 'customer' | 'guide';

type BubbleAlign = 'left' | 'right' | 'center';

interface PanelCharacter {
  id: CharacterId;
  x: number;
  y: number;
  scale?: number;
}

interface WebtoonPanel {
  scene: string;
  sceneAccent: string;
  characters: PanelCharacter[];
  bubble: {
    align: BubbleAlign;
    speaker: string;
    speakerColor: string;
    text: string;
    highlight?: string;
  };
  caption?: string;
}

interface WebtoonEpisode {
  num: number;
  title: string;
  subtitle: string;
  panels: WebtoonPanel[];
}

const characterMeta: Record<
  CharacterId,
  { label: string; bg: string; border: string; emoji: string; role: string }
> = {
  owner: {
    label: '김사장',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    emoji: '👔',
    role: '광고주',
  },
  partner: {
    label: '홍보왕 민지',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    emoji: '📱',
    role: '파트너',
  },
  customer: {
    label: '손님',
    bg: 'bg-sky-100',
    border: 'border-sky-300',
    emoji: '🛒',
    role: '고객',
  },
  guide: {
    label: '링크커넥트',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    emoji: '🔗',
    role: '안내자',
  },
};

const episodes: WebtoonEpisode[] = [
  {
    num: 1,
    title: '제휴마케팅이 뭐예요?',
    subtitle: '광고비는 나가는데, 손님은 안 오는 사장님',
    panels: [
      {
        scene: 'from-amber-50 to-orange-100',
        sceneAccent: 'bg-amber-200/40',
        characters: [{ id: 'owner', x: 50, y: 62, scale: 1.1 }],
        bubble: {
          align: 'left',
          speaker: '김사장',
          speakerColor: 'text-amber-700',
          text: '광고비는 많이 썼는데… 손님이 늘지 않아요. 효과가 있는지도 모르겠고요 😰',
        },
        caption: '동네 쇼핑몰 사장님, 요즘 고민이 많습니다.',
      },
      {
        scene: 'from-indigo-50 to-violet-100',
        sceneAccent: 'bg-indigo-200/30',
        characters: [
          { id: 'guide', x: 50, y: 58, scale: 1.15 },
        ],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '걱정 마세요! 성과가 났을 때만 보상하는 광고 방식이 있어요. 바로 제휴 마케팅입니다 ✨',
          highlight: '성과가 났을 때만 보상',
        },
      },
      {
        scene: 'from-emerald-50 to-teal-100',
        sceneAccent: 'bg-emerald-200/30',
        characters: [
          { id: 'owner', x: 22, y: 65 },
          { id: 'partner', x: 78, y: 65 },
          { id: 'customer', x: 50, y: 78, scale: 0.9 },
        ],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '파트너가 고객을 소개하고, 실제 성과(구매·상담)가 생기면 광고주가 보상해요!',
        },
        caption: '소개 → 성과 → 보상. 이게 제휴 마케팅의 핵심!',
      },
    ],
  },
  {
    num: 2,
    title: 'CPA는 뭐예요?',
    subtitle: '신청·상담·가입하면 수익!',
    panels: [
      {
        scene: 'from-emerald-50 to-green-100',
        sceneAccent: 'bg-emerald-200/40',
        characters: [{ id: 'partner', x: 35, y: 62 }],
        bubble: {
          align: 'left',
          speaker: '홍보왕 민지',
          speakerColor: 'text-emerald-700',
          text: '블로그에 "무료 상담 신청" 링크를 올려볼까? 📲',
        },
      },
      {
        scene: 'from-sky-50 to-blue-100',
        sceneAccent: 'bg-sky-200/30',
        characters: [
          { id: 'customer', x: 55, y: 60 },
          { id: 'partner', x: 20, y: 72, scale: 0.85 },
        ],
        bubble: {
          align: 'right',
          speaker: '손님',
          speakerColor: 'text-sky-700',
          text: '오, 무료 상담이네? 신청해볼게요!',
        },
        caption: '고객이 링크를 눌러 상담 신청을 완료합니다.',
      },
      {
        scene: 'from-emerald-100 to-teal-100',
        sceneAccent: 'bg-emerald-300/30',
        characters: [{ id: 'partner', x: 50, y: 58, scale: 1.1 }],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '상담 신청 1건 = 10,000원! CPA는 고객의 "행동"이 완료되면 수익이 발생해요.',
          highlight: 'CPA = Cost Per Action (행동형)',
        },
      },
    ],
  },
  {
    num: 3,
    title: 'CPS는 뭐예요?',
    subtitle: '구매하면 수수료!',
    panels: [
      {
        scene: 'from-cyan-50 to-sky-100',
        sceneAccent: 'bg-cyan-200/40',
        characters: [{ id: 'partner', x: 30, y: 62 }],
        bubble: {
          align: 'left',
          speaker: '홍보왕 민지',
          speakerColor: 'text-emerald-700',
          text: '이번엔 쇼핑몰 상품 리뷰 + 구매 링크를 올려볼게! 🛍️',
        },
      },
      {
        scene: 'from-violet-50 to-purple-100',
        sceneAccent: 'bg-violet-200/30',
        characters: [
          { id: 'customer', x: 60, y: 58 },
        ],
        bubble: {
          align: 'right',
          speaker: '손님',
          speakerColor: 'text-sky-700',
          text: '좋아 보이네! 링크 타고 50,000원짜리 구매할게요 💳',
        },
      },
      {
        scene: 'from-cyan-100 to-indigo-100',
        sceneAccent: 'bg-cyan-300/30',
        characters: [{ id: 'partner', x: 50, y: 58, scale: 1.1 }],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '50,000원 × 수수료 10% = 5,000원! CPS는 "구매"가 완료되면 수익이 발생해요.',
          highlight: 'CPS = Cost Per Sale (판매형)',
        },
      },
    ],
  },
  {
    num: 4,
    title: 'CPA vs CPS',
    subtitle: '한눈에 비교하기',
    panels: [
      {
        scene: 'from-slate-50 to-slate-100',
        sceneAccent: 'bg-slate-200/30',
        characters: [],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '같은 제휴 마케팅이지만, 수익이 발생하는 순간이 달라요!',
        },
      },
      {
        scene: 'from-emerald-50 via-white to-cyan-50',
        sceneAccent: 'bg-gradient-to-r from-emerald-200/20 to-cyan-200/20',
        characters: [
          { id: 'partner', x: 25, y: 65 },
          { id: 'customer', x: 75, y: 65 },
        ],
        bubble: {
          align: 'center',
          speaker: '비교',
          speakerColor: 'text-slate-700',
          text: 'CPA → 상담·가입·문의·예약  |  CPS → 쇼핑몰 구매·결제 완료',
          highlight: '행동 vs 구매',
        },
        caption: 'CPA: 신청만 해도 OK  ·  CPS: 구매가 되어야 OK',
      },
    ],
  },
  {
    num: 5,
    title: '광고주는 왜 좋아요?',
    subtitle: '성과 없으면 비용도 없어요',
    panels: [
      {
        scene: 'from-amber-50 to-orange-100',
        sceneAccent: 'bg-amber-200/40',
        characters: [{ id: 'owner', x: 50, y: 62 }],
        bubble: {
          align: 'left',
          speaker: '김사장',
          speakerColor: 'text-amber-700',
          text: '성과 없이 광고비만 나가는 게 제일 무서웠어요…',
        },
      },
      {
        scene: 'from-cyan-50 to-emerald-100',
        sceneAccent: 'bg-cyan-200/30',
        characters: [
          { id: 'owner', x: 30, y: 65 },
          { id: 'guide', x: 70, y: 58 },
        ],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '제휴 마케팅은 실제 성과가 있을 때만 비용을 지불해요. 파트너들이 대신 홍보하고, 광고비 효율도 한눈에 확인!',
          highlight: '성과 중심 · 예산 낭비 ZERO',
        },
      },
    ],
  },
  {
    num: 6,
    title: '파트너는 왜 좋아요?',
    subtitle: '링크 하나로 수익화',
    panels: [
      {
        scene: 'from-emerald-50 to-teal-100',
        sceneAccent: 'bg-emerald-200/40',
        characters: [{ id: 'partner', x: 50, y: 62, scale: 1.1 }],
        bubble: {
          align: 'left',
          speaker: '홍보왕 민지',
          speakerColor: 'text-emerald-700',
          text: '와… 내 블로그 글 하나로 수익이 쌓이네? 😲',
        },
      },
      {
        scene: 'from-indigo-50 to-violet-100',
        sceneAccent: 'bg-indigo-200/30',
        characters: [
          { id: 'partner', x: 35, y: 65 },
          { id: 'guide', x: 68, y: 58 },
        ],
        bubble: {
          align: 'center',
          speaker: '링크커넥트',
          speakerColor: 'text-indigo-700',
          text: '가입비 0원! 원하는 캠페인을 골라 링크 하나로 성과를 추적하고, 실시간으로 수익을 확인하세요 🎉',
          highlight: '자본금 없이 시작 · 실시간 수익 확인',
        },
        caption: '사장님도, 홍보왕도, 모두 Win-Win!',
      },
    ],
  },
];

function CharacterSprite({ id, scale = 1 }: { id: CharacterId; scale?: number }) {
  const meta = characterMeta[id];
  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `scale(${scale})` }}
    >
      <div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${meta.bg} border-2 ${meta.border} flex items-center justify-center text-3xl md:text-4xl shadow-md`}
      >
        {meta.emoji}
      </div>
      <span className="mt-1.5 text-[10px] md:text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
        {meta.label}
      </span>
    </div>
  );
}

function SpeechBubble({
  align,
  speaker,
  speakerColor,
  text,
  highlight,
}: WebtoonPanel['bubble']) {
  const alignClass =
    align === 'left'
      ? 'ml-2 mr-auto max-w-[88%]'
      : align === 'right'
        ? 'ml-auto mr-2 max-w-[88%]'
        : 'mx-auto max-w-[92%]';

  const tailClass =
    align === 'left'
      ? 'before:left-8'
      : align === 'right'
        ? 'before:right-8 before:left-auto'
        : 'before:left-1/2 before:-translate-x-1/2';

  return (
    <div
      className={`relative bg-white border-2 border-slate-900 rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_rgba(15,23,42,1)] ${alignClass} before:content-[''] before:absolute before:-bottom-2 before:w-4 before:h-4 before:bg-white before:border-b-2 before:border-r-2 before:border-slate-900 before:rotate-45 ${tailClass}`}
    >
      <p className={`text-xs font-bold mb-1 ${speakerColor}`}>{speaker}</p>
      <p className="text-sm md:text-base text-slate-800 leading-relaxed font-medium">
        {highlight && text.includes(highlight) ? (
          <>
            {text.split(highlight)[0]}
            <strong className="text-emerald-600 font-bold">{highlight}</strong>
            {text.split(highlight)[1]}
          </>
        ) : (
          text
        )}
      </p>
    </div>
  );
}

function WebtoonPanelView({ panel, index }: { panel: WebtoonPanel; index: number }) {
  return (
    <article
      className={`relative min-h-[280px] md:min-h-[320px] bg-gradient-to-b ${panel.scene} border-b-4 border-slate-900/10 overflow-hidden`}
    >
      <div className={`absolute inset-0 ${panel.sceneAccent}`} />
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/70 border border-slate-300 flex items-center justify-center text-xs font-black text-slate-500">
        {index + 1}
      </div>

      {/* Scene decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/5 to-transparent" />

      {/* Characters */}
      <div className="absolute inset-0">
        {panel.characters.map((ch) => (
          <div
            key={`${ch.id}-${ch.x}-${ch.y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ch.x}%`, top: `${ch.y}%` }}
          >
            <CharacterSprite id={ch.id} scale={ch.scale} />
          </div>
        ))}
      </div>

      {/* Bubble */}
      <div className="relative z-10 px-4 pt-6 pb-5 min-h-[280px] md:min-h-[320px] flex flex-col justify-start">
        <div className="mt-2">
          <SpeechBubble {...panel.bubble} />
        </div>
        {panel.caption && (
          <p className="mt-auto pt-4 text-center text-xs md:text-sm font-bold text-slate-600/80 tracking-wide">
            — {panel.caption} —
          </p>
        )}
      </div>
    </article>
  );
}

function EpisodeBlock({ episode }: { episode: WebtoonEpisode }) {
  return (
    <section className="scroll-mt-24" id={`webtoon-ep${episode.num}`}>
      <header className="sticky top-[72px] z-20 bg-slate-900 text-white px-5 py-4 border-b-4 border-emerald-400">
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
            {episode.num}화
          </span>
          <div>
            <h3 className="font-bold text-base md:text-lg leading-tight">{episode.title}</h3>
            <p className="text-emerald-300/90 text-xs md:text-sm">{episode.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="divide-y-0">
        {episode.panels.map((panel, i) => (
          <WebtoonPanelView key={i} panel={panel} index={i} />
        ))}
      </div>
    </section>
  );
}

export function AffiliateWebtoon() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100" id="webtoon">
      <div className="max-w-lg mx-auto mb-10 text-center">
        <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-emerald-600 text-sm font-bold mb-5 shadow-sm">
          <BookOpen className="w-4 h-4" />
          5분 만화로 배우기
        </p>
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">
          사장님과 홍보왕의
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
            제휴마케팅 입문기
          </span>
        </h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed">
          CPA·CPS가 뭔지, 광고주와 파트너에게 왜 좋은지
          <br className="hidden sm:block" />
          웹툰 6화로 쉽게 알아보세요.
        </p>

        {/* Character legend */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {(Object.keys(characterMeta) as CharacterId[]).map((id) => (
            <span
              key={id}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${characterMeta[id].bg} ${characterMeta[id].border} text-slate-700`}
            >
              <span>{characterMeta[id].emoji}</span>
              {characterMeta[id].label}
              <span className="text-slate-400 font-normal">({characterMeta[id].role})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Episode nav */}
      <nav className="max-w-lg mx-auto mb-6 flex flex-wrap justify-center gap-2">
        {episodes.map((ep) => (
          <a
            key={ep.num}
            href={`#webtoon-ep${ep.num}`}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors shadow-sm"
          >
            {ep.num}화
          </a>
        ))}
      </nav>

      {/* Webtoon scroll container — mobile-first vertical scroll style */}
      <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,0.15)] bg-white">
        {episodes.map((ep) => (
          <EpisodeBlock key={ep.num} episode={ep} />
        ))}

        {/* End card */}
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 px-6 py-10 text-center text-white">
          <p className="text-2xl font-black mb-2">🎬 END</p>
          <p className="text-sm md:text-base font-medium opacity-90 leading-relaxed">
            이제 제휴 마케팅, CPA, CPS가 뭔지 알겠죠?
            <br />
            링크 하나로 시작해 보세요!
          </p>
        </div>
      </div>

      <p className="max-w-lg mx-auto mt-6 text-center text-slate-400 text-xs flex items-center justify-center gap-1">
        <ChevronDown className="w-4 h-4 animate-bounce" />
        아래에서 자세한 설명도 확인하세요
      </p>
    </section>
  );
}
