type Props = {
  name: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  fetchPriority?: 'high' | 'low' | 'auto';
};

/** public/{name}.webp + .jpg 폴백 (PNG 대비 용량 절감) */
export default function PublicPicture({
  name,
  alt,
  className,
  loading = 'lazy',
  width,
  height,
  fetchPriority,
}: Props) {
  const base = import.meta.env.BASE_URL;
  return (
    <picture>
      <source srcSet={`${base}${name}.webp`} type="image/webp" />
      <img
        src={`${base}${name}.jpg`}
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
