interface ImageGalleryProps {
  title: string;
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
  if (!images.length) return null;

  return (
    <section className={className}>
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          {title}
        </h2>
        <span className="text-sm text-slate-500">{images.length} imagini</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {images.map((url, index) => (
          <figure
            key={`${url}-${index}`}
            className="group overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-white"
          >
            <img
              src={url}
              alt={`${altPrefix} ${index + 1}`}
              className="w-full h-36 sm:h-44 md:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
