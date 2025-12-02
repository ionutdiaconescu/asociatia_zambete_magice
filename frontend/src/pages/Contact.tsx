import { usePage } from "../hooks/usePage";
import { Meta } from "../components/seo/Meta";
import { ContentState } from "../components/ui/ContentState";

export default function Contact() {
  const { data, loading, error, reload } = usePage("contact");

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
            className="w-full h-56 object-cover"
            loading="lazy"
          />
        </div>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        {data?.title || "Contact"}
      </h1>
      <p className="text-gray-600 mb-8">
        Suntem aici pentru întrebări, propuneri și sprijin.
      </p>
      <ContentState
        state={{ data, loading, error, reload }}
        skeleton={
          <div className="space-y-4 animate-pulse" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        }
      >
        {(page) => (
          <div>
            {/* Contact grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="p-6 border rounded-xl shadow-sm bg-white">
                <h2 className="text-lg font-semibold mb-2">Adresă</h2>
                <p className="text-gray-700">{page.address || "—"}</p>
              </div>
              <div className="p-6 border rounded-xl shadow-sm bg-white">
                <h2 className="text-lg font-semibold mb-2">Telefon</h2>
                <p className="text-gray-700">{page.phone || "—"}</p>
              </div>
              <div className="p-6 border rounded-xl shadow-sm bg-white">
                <h2 className="text-lg font-semibold mb-2">Email</h2>
                <p className="text-gray-700">{page.email || "—"}</p>
              </div>
            </div>

            {/* Body rich text */}
            <article className="prose max-w-none">
              <div
                className="leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            </article>

            {/* Gallery */}
            {page.galleryUrls && page.galleryUrls.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Imagini</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {page.galleryUrls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt={`Imagine ${i + 1}`}
                      className="w-full h-40 object-cover rounded-xl shadow"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </ContentState>
    </div>
  );
}
