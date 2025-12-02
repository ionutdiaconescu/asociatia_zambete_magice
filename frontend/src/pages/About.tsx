import { usePage } from "../hooks/usePage";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";

export default function About() {
  const { data, loading, error, reload } = usePage("about");

  return (
    <div className="max-w-6xl mx-auto py-24 px-4">
      {data && (
        <Meta title={data.title} description={data.body.slice(0, 140)} />
      )}
      {/* Hero section */}
      {data?.heroImageUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl shadow">
          <img
            src={data.heroImageUrl}
            alt={data.title}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
        </div>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        {data?.title || "Despre noi"}
      </h1>
      <p className="text-gray-600 mb-10">
        Află povestea, misiunea și valorile noastre.
      </p>
      <ContentState
        state={{ data, loading, error, reload }}
        skeleton={
          <div className="space-y-4 animate-pulse" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        }
      >
        {(page) => (
          <article className="prose max-w-none">
            {/* Body rich text rendered as HTML */}
            <div
              className="leading-relaxed text-gray-800 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
            {/* Gallery */}
            {page.galleryUrls && page.galleryUrls.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Galerie</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {page.galleryUrls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt={`Galerie ${i + 1}`}
                      className="w-full h-40 object-cover rounded-xl shadow"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </ContentState>
    </div>
  );
}
