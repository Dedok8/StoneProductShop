import AdvantagesPage from "@/pages/home/AdvantagesPage";
import HomeSwiper from "@/pages/home/HomeSwiper";
import ProductsSection from "@/pages/home/ProductSection";
import { heroSlides } from "@/shared/types";

function HomePage() {
  return (
    <>
      <HomeSwiper slides={heroSlides} />
      <AdvantagesPage />
      <ProductsSection />
    </>
  );
}

export default HomePage;
