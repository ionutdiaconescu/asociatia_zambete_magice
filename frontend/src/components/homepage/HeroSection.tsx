import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { RichHtml } from "../ui/RichHtml";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  backgroundImage?: string | null;
  /**
   * Cum să fie redată imaginea de fundal.
   * cover = umple complet spațiul (poate tăia la margini)
   * contain = încadrată complet (poate lăsa benzi laterale)
   */
  backgroundFit?: "cover" | "contain";
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  backgroundImage,
  backgroundFit = "cover",
}: HeroSectionProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [backgroundImage]);

  return (
    <section className="relative text-white overflow-hidden min-h-[600px] md:min-h-[680px] flex items-center">
      {/* Layer: gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-purple-700 via-blue-600 to-indigo-700" />

      {/* Layer: image - suport atât cover cât și contain */}
      {backgroundImage &&
        !imageFailed &&
        (backgroundFit === "cover" ? (
          <div className="absolute inset-0 -z-10">
            <img
              src={backgroundImage}
              alt="Imagine reprezentativă hero"
              className="w-full h-full object-cover object-center brightness-[0.9]"
              onError={() => setImageFailed(true)}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        ) : (
          <div className="absolute inset-0 -z-10 flex items-center justify-center p-4 md:p-8">
            <img
              src={backgroundImage}
              alt="Imagine reprezentativă încadrată"
              className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-xl brightness-95"
              onError={() => setImageFailed(true)}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{
                // Mică ajustare pentru imagini foarte înalte - limităm puțin înălțimea
                maxHeight: "90%",
              }}
            />
          </div>
        ))}

      {/* Layer: dark overlay for readability */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

      {/* Decorative blobs only if no image */}
      {(!backgroundImage || imageFailed) && (
        <>
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative container mx-auto px-4 py-24 md:py-28 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-md">
          {title}
        </h1>
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-8 opacity-90 max-w-4xl mx-auto font-light drop-shadow-sm">
          {subtitle}
        </h2>
        {description && (
          <RichHtml
            html={description}
            className="text-lg md:text-xl mb-12 opacity-85 max-w-3xl mx-auto leading-relaxed"
          />
        )}
        {ctaText && ctaLink && (
          <Link
            to={ctaLink}
            className="inline-flex items-center bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl hover:bg-gray-100 transform hover:scale-[1.03] transition-all duration-300"
          >
            {ctaText}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>
    </section>
  );
}
