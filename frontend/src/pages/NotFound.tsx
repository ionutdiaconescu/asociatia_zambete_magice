export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Pagina nu a fost găsită.</p>
      <a
        href="/"
        className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
      >
        Înapoi la început
      </a>
    </div>
  );
}
