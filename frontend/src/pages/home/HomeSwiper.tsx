import { useRef, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HomeInfo from "@/pages/home/HomeInfo";

interface IHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

interface HeroSwiperProps {
  slides: IHeroSlide[];
}

function HomeSwiper({ slides }: HeroSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="relative h-[665px] w-full overflow-hidden bg-black">
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1}
        loop
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        pagination={{
          el: ".hero-pagination",
          clickable: true,
          bulletClass: "hero-bullet",
          bulletActiveClass: "hero-bullet-active",
        }}
        navigation={{
          prevEl: ".hero-prev",
          nextEl: ".hero-next",
        }}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full w-full max-w-[600px] flex-col justify-center gap-6 px-16">
        <HomeInfo />
      </div>

      <button
        className="hero-prev absolute bottom-10 left-16 z-10 flex h-10 w-10 items-center justify-center border border-white/40 text-white hover:bg-emerald-700"
        aria-label="Предыдущий слайд"
      >
        ‹
      </button>
      <button
        className="hero-next absolute bottom-10 left-[calc(4rem+48px)] z-10 flex h-10 w-10 items-center justify-center border border-white/40 text-white hover:bg-emerald-700"
        aria-label="Следующий слайд"
      >
        ›
      </button>

      <div className="hero-pagination absolute bottom-16 left-16 z-10 flex gap-2" />
    </section>
  );
}

export default HomeSwiper;
