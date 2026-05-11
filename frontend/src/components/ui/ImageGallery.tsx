import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";

interface ImageGalleryProps {
  title?: string;
  images: string[];
  altPrefix: string;
  className?: string;
}

export function ImageGallery({
  title,
  images,
  altPrefix,
  className = "",
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openImage = (index: number) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);

  if (!images.length) return null;

  return (
    <section className={className}>
      <div className="flex items-end justify-between mb-5">
        {title ? (
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            {title}
          </h2>
        ) : (
          <div />
        )}
        <span className="text-sm text-slate-500">{images.length} imagini</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:auto-rows-[180px] md:gap-5">
        {images.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => openImage(index)}
            className={[
              "group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-4",
              index === 0
                ? "col-span-2 md:col-span-7 md:row-span-2"
                : index % 5 === 0
                  ? "col-span-2 md:col-span-5"
                  : "md:col-span-4",
            ].join(" ")}
            aria-label={`Deschide imaginea ${index + 1} într-o vizualizare mărită`}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            <img
              src={url}
              alt={`${altPrefix} ${index + 1}`}
              className="h-36 w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-44 md:h-full"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-4 text-white md:px-5">
              <span>
                <span className="block text-xs uppercase tracking-[0.24em] text-white/70">
                  Galerie foto
                </span>
                <span className="mt-1 block text-sm font-semibold md:text-base">
                  Vezi imaginea {index + 1}
                </span>
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-lg backdrop-blur-sm">
                +
              </span>
            </span>
          </button>
        ))}
      </div>
      <ImageLightbox
        images={images}
        activeIndex={activeIndex}
        altPrefix={altPrefix}
        onClose={closeLightbox}
        onSelect={setActiveIndex}
      />
    </section>
  );
}
