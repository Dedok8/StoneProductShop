import { FaChevronDown } from "react-icons/fa";

import type { IAdvantageItem } from "@/widgets/homeFn/model/constants";

interface AdvantagesRowProps {
  item: IAdvantageItem;
  isOpen: boolean;
  onToggle: () => void;
  align?: "left" | "right";
}

export function AdvantagesRow({
  item,
  isOpen,
  onToggle,
  align = "left",
}: AdvantagesRowProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-3 sm:gap-4 ${
          align === "right" ? "flex-row-reverse text-right" : "text-left"
        }`}
      >
        <span className="shrink-0 text-sm text-neutral-500">{item.number}</span>
        <span className="h-px flex-1 bg-emerald-800/40" />

        <span className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-neutral-900 sm:text-sm">
            {item.title}
          </span>
          <FaChevronDown
            size={16}
            className={`shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <p
          className={`mt-2 text-sm text-neutral-500 ${
            align === "right" ? "ml-auto text-right" : "text-left"
          } max-w-md`}
        >
          {item.description}
        </p>
      )}
    </div>
  );
}
