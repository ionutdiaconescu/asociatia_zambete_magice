import Logo from "../../assets/sigla-no bg.webp";

export function BrandShowcase() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={Logo}
            alt="Sigla Asociația Zâmbete Magice - text integral"
            title="Asociația Zâmbete Magice"
            className="w-[480px] max-w-full h-auto object-contain drop-shadow-2xl"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 blur-xl pointer-events-none" />
        </div>
        <h2 className="mt-12 text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Asociația Zâmbete Magice
        </h2>
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Transformăm resurse, timp și bunătate în zâmbete reale pentru copii.
          Logo-ul de mai sus trebuie să fie ușor de citit – de aceea îl
          prezentăm mărit pentru recunoaștere rapidă.
        </p>
      </div>
    </section>
  );
}
