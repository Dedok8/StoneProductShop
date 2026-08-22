import { ArrowRight } from "lucide-react"; // або ваша іконка стрілки
import { useTranslation } from "react-i18next";

type Product = {
  id: string;
  title: string;
  image: string;
  href: string;
};

const PRODUCTS: Product[] = [
  { id: "countertops", title: "", image: "", href: "/catalog/" },
  { id: "windowsills", title: "", image: "", href: "/catalog/" },
  { id: "sinks", title: "", image: "rakoviny", href: "/catalog/" },
  { id: "panels", title: "", image: "", href: "/catalog/" },
];

function ProductsSection() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block h-px w-16 bg-current" />
          <h2 className="text-xl font-bold uppercase leading-snug sm:text-2xl lg:text-3xl">
            {t("products.title", "Вироби")}
            <br />
            {t("products.subtitle", "з натурального каменю")}
          </h2>
        </div>

        <a
          href="/catalog"
          className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide transition-colors hover:text-emerald-600"
        >
          {t("products.viewAll", "Дивитись усі")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {PRODUCTS.map((product) => (
          <a
            key={product.id}
            href={product.href}
            className="group relative aspect-[4/3] overflow-hidden bg-black sm:aspect-[16/10]"
          >
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
              <span className="text-base font-bold uppercase text-white sm:text-lg">
                {product.title}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default ProductsSection;
