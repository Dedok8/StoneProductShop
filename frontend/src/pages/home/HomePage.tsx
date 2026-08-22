import AdvantagesPage from "@/pages/home/AdvantagesPage";
import HomeSwiper from "@/pages/home/HomeSwiper";
import ProductsSection from "@/pages/home/ProductSection";
import { heroSlides } from "@/shared/types";
import Footer from "@/widgets/Footer/Footer";
import Header from "@/widgets/Header";

function HomePage() {
  return (
    <>
      <Header />
      <HomeSwiper slides={heroSlides} />
      <AdvantagesPage />
      <ProductsSection />
      <Footer />
    </>
  );
}

export default HomePage;
