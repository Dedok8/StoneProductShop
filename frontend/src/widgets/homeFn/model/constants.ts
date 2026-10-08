export interface IAdvantageItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const advantagesLeft: IAdvantageItem[] = [
  {
    id: "01",
    number: "01",
    title: "Latest Italian equipment DONATON",
    description:
      "We use modern Italian equipment for precise stone processing and a flawless finish.",
  },
  {
    id: "02",
    number: "02",
    title: "Our own production",
    description:
      "Full production cycle in-house — from raw material to the finished product.",
  },
  {
    id: "03",
    number: "03",
    title: "Wide range of products",
    description:
      "A broad selection of natural and artificial stone for any interior style.",
  },
];

export const advantagesRight: IAdvantageItem[] = [
  {
    id: "04",
    number: "04",
    title: "Products in stock",
    description:
      "Most items are available in stock and ready for quick delivery.",
  },
  {
    id: "05",
    number: "05",
    title: "Turnkey service",
    description:
      "We handle everything — from measurement to installation — so you don't have to.",
  },
  {
    id: "06",
    number: "06",
    title: "Stone care consultations",
    description:
      "Free expert advice on how to care for and maintain your stone products.",
  },
];
