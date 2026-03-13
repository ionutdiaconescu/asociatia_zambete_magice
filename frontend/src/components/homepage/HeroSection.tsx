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
  const isExternalCta =
    !!ctaLink && /^(https?:\/\/|\/\/|mailto:|tel:)/i.test(ctaLink);

  useEffect(() => {
    setImageFailed(false);
  }, [backgroundImage]);

  return (
    <section className="relative isolate flex min-h-[540px] items-center overflow-hidden text-white sm:min-h-[620px] md:min-h-[700px]">
      {/* Layer: gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-900 via-orange-800 to-rose-700" />

      {/* Layer: image - suport atât cover cât și contain */}
      {backgroundImage &&
        !imageFailed &&
        (backgroundFit === "cover" ? (
          <div className="absolute inset-0 z-10">
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
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">
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
      <div className="absolute inset-0 z-20 bg-gradient-to-tr from-amber-950/62 via-orange-900/36 to-rose-900/24" />

      {/* Decorative blobs only if no image */}
      {(!backgroundImage || imageFailed) && (
        <>
          <div className="absolute top-10 left-10 z-10 w-72 h-72 bg-amber-100/12 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 z-10 w-96 h-96 bg-rose-200/15 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative z-30 container mx-auto px-4 py-20 text-center sm:py-24 md:py-28">
        <h1 className="mb-6 text-4xl font-extrabold leading-tight drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <h2 className="mx-auto mb-8 max-w-4xl text-xl font-medium opacity-95 drop-shadow-sm sm:text-2xl md:text-3xl lg:text-4xl">
          {subtitle}
        </h2>
        {description && (
          <RichHtml
            html={description}
            className="mx-auto mb-10 max-w-3xl text-base leading-relaxed opacity-85 sm:text-lg md:mb-12 md:text-xl"
          />
        )}
        {ctaText &&
          ctaLink &&
          (isExternalCta ? (
            <a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-base font-semibold text-amber-800 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:bg-amber-50 hover:shadow-2xl sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
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
            </a>
          ) : (
            <Link
              to={ctaLink}
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-base font-semibold text-amber-800 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:bg-amber-50 hover:shadow-2xl sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
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
          ))}
      </div>
    </section>
  );
}
