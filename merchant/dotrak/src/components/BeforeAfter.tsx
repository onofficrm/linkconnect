import { useEffect, useRef, useState } from 'react';

type BeforeAfterProps = {
  src: string;
  alt: string;
  /** stack: 위가 시술 전, 아래가 시술 후. side: 왼쪽이 시술 전, 오른쪽이 시술 후. */
  mode: 'stack' | 'side';
  /** stack 이미지에서 시술 전 영역이 끝나는 비율 */
  beforeEnd?: number;
  /** stack 이미지에서 시술 후 영역이 시작하는 비율 */
  afterStart?: number;
  frame?: 'natural' | 'card';
  showTags?: boolean;
};

export default function BeforeAfter({
  src,
  alt,
  mode,
  beforeEnd = 0.5,
  afterStart = 0.5,
  frame = 'card',
  showTags = true,
}: BeforeAfterProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(62);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 1, h: 1 });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => setSize({ w: box.clientWidth, h: box.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const aspect =
    frame === 'card'
      ? '4 / 5'
      : mode === 'side'
        ? '1 / 1'
        : `${natural.w} / ${Math.max(1, natural.h * beforeEnd)}`;

  const afterFrac = Math.max(0.2, 1 - afterStart);
  const sideStyle = { width: '100%', height: '100%', objectFit: 'cover' as const };
  const beforeStyle =
    mode === 'side'
      ? sideStyle
      : { width: size.w, height: size.h / Math.max(0.2, beforeEnd), objectPosition: 'center top' as const };
  const afterStyle =
    mode === 'side'
      ? sideStyle
      : {
          width: size.w,
          height: size.h / afterFrac,
          objectPosition: 'center bottom' as const,
          top: 'auto' as const,
          bottom: 0,
        };

  return (
    <div className="ba" ref={boxRef} style={{ aspectRatio: aspect }}>
      <img
        src={src}
        alt=""
        className="ba-probe"
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth) setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />
      <div className="ba-layer ba-after">
        <img src={src} alt="" style={afterStyle} />
      </div>
      <div className="ba-clip" style={{ width: `${pos}%` }}>
        <div className="ba-layer">
          <img src={src} alt={alt} style={beforeStyle} />
        </div>
        {showTags && <span className="ba-tag ba-tag-before">BEFORE</span>}
      </div>
      {showTags && <span className="ba-tag ba-tag-after">AFTER</span>}
      <span className="ba-handle" style={{ left: `${pos}%` }} aria-hidden="true" />
      <input
        className="ba-range"
        type="range"
        min={8}
        max={92}
        value={pos}
        aria-label={`${alt} 시술 전후 비교`}
        onChange={(event) => setPos(Number(event.target.value))}
      />
    </div>
  );
}
