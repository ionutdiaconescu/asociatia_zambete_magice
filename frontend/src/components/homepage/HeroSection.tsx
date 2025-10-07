import React from "react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  backgroundImage?: string | null;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  backgroundImage,
}: HeroSectionProps) {
  return (
    <section
      className="relative text-white py-24 overflow-hidden"
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`
          : "linear-gradient(135deg, #9333ea 0%, #3b82f6 50%, #4f46e5 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background overlay pentru lizibilitate */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Decorative elements - doar dacă nu avem imagine */}
      {!backgroundImage && (
        <>
          <div className="absolute top-10 left-10 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500 bg-opacity-20 rounded-full blur-3xl"></div>
        </>
      )}

      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {title}
        </h1>

        <h2 className="text-xl md:text-2xl lg:text-3xl mb-8 opacity-90 max-w-4xl mx-auto font-light">
          {subtitle}
        </h2>

        {description && (
          <div
            className="text-lg md:text-xl mb-12 opacity-80 max-w-3xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {ctaText && ctaLink && (
          <Link
            to={ctaLink}
            className="inline-flex items-center bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
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
