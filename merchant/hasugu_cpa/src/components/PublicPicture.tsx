import { hasuguAsset } from '../lib/hasuguAsset';

type Props = {
  name: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  fetchPriority?: 'high' | 'low' | 'auto';
};

/** public/{name}.webp + .jpg 폴백 — merchant-static 프록시로 핫링크 회피 */
export default function PublicPicture({
  name,
  alt,
  className,
  loading = 'lazy',
  width,
  height,
  fetchPriority,
}: Props) {
  return (
    <picture>
      <source srcSet={hasuguAsset(`${name}.webp`)} type="image/webp" />
      <img
        src={hasuguAsset(`${name}.jpg`)}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}
