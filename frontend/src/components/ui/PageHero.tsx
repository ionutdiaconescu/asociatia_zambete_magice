interface PageHeroProps {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  badge?: string;
  minHeightClassName?: string;
  gradientClassName: string;
  overlayClassName?: string;
  className?: string;
}

const DEFAULT_OVERLAY =
  "absolute inset-0 bg-gradient-to-tr from-amber-950/75 via-orange-900/45 to-rose-900/30";

export function PageHero({
  title,
  subtitle,
  imageUrl,
  badge,
  minHeightClassName = "min-h-[320px] md:min-h-[400px]",
  gradientClassName,
  overlayClassName = DEFAULT_OVERLAY,
  className = "",
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl shadow-xl mb-10 md:mb-14 ${minHeightClassName} ${className}`.trim()}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`absolute inset-0 ${gradientClassName}`} />
      )}

      <div className={overlayClassName} />

      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 py-10 md:py-14">
        {badge ? (
          <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/20 text-white backdrop-blur-sm mb-4">
            {badge}
          </span>
        ) : null}

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 max-w-3xl">
          {title}
        </h1>
        <p className="text-slate-100/95 text-base md:text-lg max-w-2xl">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
