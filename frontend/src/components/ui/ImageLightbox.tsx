import { useEffect, useRef } from "react";

interface ImageLightboxProps {
  images: string[];
  activeIndex: number | null;
  altPrefix: string;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export function ImageLightbox({
  images,
  activeIndex,
  altPrefix,
  onClose,
  onSelect,
}: ImageLightboxProps) {
  const touchStartX = useRef<number | null>(null);

  const isOpen = activeIndex !== null && images[activeIndex];

  const showPrevious = () => {
    if (activeIndex === null) return;
    onSelect(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  };

  const showNext = () => {
    if (activeIndex === null) return;
    onSelect(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex, images.length, onClose]);

  if (!isOpen || activeIndex === null) return null;

  const activeImage = images[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/94 px-3 py-4 backdrop-blur-md sm:px-5 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Vizualizare mărită galerie"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-6xl flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 sm:text-xs">
              {altPrefix}
            </p>
            <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
              Imaginea {activeIndex + 1} din {images.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Închide galeria"
          >
            ×
          </button>
        </div>

        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(15,23,42,0.12)_45%,rgba(2,6,23,0.8)_100%)] shadow-[0_32px_110px_rgba(0,0,0,0.5)]"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null || images.length < 2) return;
            const touchEndX =
              event.changedTouches[0]?.clientX ?? touchStartX.current;
            const delta = touchEndX - touchStartX.current;
            touchStartX.current = null;

            if (Math.abs(delta) < 48) return;
            if (delta > 0) showPrevious();
            else showNext();
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
          <img
            src={activeImage}
            alt={`${altPrefix} ${activeIndex + 1}`}
            className="max-h-[76vh] min-h-[38vh] w-full object-contain bg-transparent"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/45 text-2xl text-white transition hover:bg-slate-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
                aria-label="Imaginea anterioară"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/45 text-2xl text-white transition hover:bg-slate-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
                aria-label="Imaginea următoare"
              >
                ›
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent px-4 py-5 text-xs font-medium uppercase tracking-[0.2em] text-white/70 sm:hidden">
                <span>Glisează pentru navigare</span>
              </div>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 md:gap-3">
            {images.map((url, index) => (
              <button
                key={`${url}-thumb-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={[
                  "overflow-hidden rounded-2xl border bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  index === activeIndex
                    ? "border-white shadow-[0_12px_32px_rgba(255,255,255,0.14)]"
                    : "border-white/10 opacity-65 hover:opacity-100",
                ].join(" ")}
                aria-label={`Afișează imaginea ${index + 1}`}
              >
                <img
                  src={url}
                  alt={`${altPrefix} miniatură ${index + 1}`}
                  className="h-16 w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
