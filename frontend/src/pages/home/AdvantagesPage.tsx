import { useState } from "react";

import AdvantagesImg from "@/assets/advantages/advantageImg.png";
import {
  advantagesLeft,
  advantagesRight,
  AdvantagesRow,
} from "@/widgets/homeFn";

function AdvantagesPage() {
  const [openId, setOpenId] = useState<string | null>("01");

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="px-4 py-12 sm:px-8 lg:px-16">
      <div className="mb-10 text-center lg:mb-16">
        <span className="mx-auto mb-2 block h-px w-12 bg-emerald-600" />
        <h2 className="text-2xl font-medium uppercase text-neutral-900 sm:text-3xl">
          Our Advantages
        </h2>
        <h2 className="text-2xl font-medium uppercase text-emerald-600 sm:text-3xl">
          Your Result
        </h2>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-12">
        <div className="order-first w-full max-w-[280px] lg:order-none">
          <div className="relative overflow-hidden rounded-3xl border-[6px] border-emerald-700 p-1">
            <img
              src={AdvantagesImg}
              alt="Stone products in interior"
              className="aspect-[467/646] w-full rounded-2xl object-cover"
            />
          </div>
        </div>

        <div className="order-2 flex w-full max-w-md flex-col gap-8 lg:order-none lg:max-w-none lg:gap-10">
          {advantagesLeft.map((item) => (
            <AdvantagesRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
              align="left"
            />
          ))}
        </div>

        <div className="order-3 flex w-full max-w-md flex-col gap-8 lg:order-none lg:max-w-none lg:gap-10">
          {advantagesRight.map((item) => (
            <AdvantagesRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
              align="right"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdvantagesPage;
