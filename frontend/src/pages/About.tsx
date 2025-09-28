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
      <h1 className="text-3xl font-bold mb-6">{data?.title || "Despre noi"}</h1>
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
            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {page.body}
            </p>
          </article>
        )}
      </ContentState>
    </div>
  );
}
