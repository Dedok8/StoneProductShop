import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/components/accordion";

interface IFilterCategory {
  id: string;
  name: string;
  children?: IFilterCategory[];
}

interface IFilterOption {
  id: string;
  name: string;
}

interface IProductFilterSidebarProps {
  categories: IFilterCategory[];
  productTypes: IFilterOption[];
  origins: IFilterOption[];
  colors: IFilterOption[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  selectedProductTypeId?: string;
  onSelectProductType?: (id: string) => void;
  selectedOriginId?: string;
  onSelectOrigin?: (id: string) => void;
  selectedColorId?: string;
  onSelectColor?: (id: string) => void;
}

function CategoryNode({
  category,
  depth,
  selectedId,
  onSelect,
}: {
  category: IFilterCategory;
  depth: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!category.children?.length;
  const isSelected = selectedId === category.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) {
            setIsOpen((prev) => !prev);
          } else {
            onSelect?.(category.id);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between py-2 text-left text-sm transition-colors",
          depth === 0 ? "text-stone-900" : "pl-4 text-stone-600",
          isSelected && "font-medium text-emerald-700",
          "hover:text-emerald-700"
        )}
      >
        <span className={cn(depth > 0 && "italic")}>{category.name}</span>
        {hasChildren && (
          <ChevronRight
            size={16}
            className={cn(
              "text-stone-400 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="border-l border-stone-100 pl-2">
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FlatFilterList({
  options,
  selectedId,
  onSelect,
}: {
  options: IFilterOption[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <ul className="space-y-1">
      {options.map((option) => (
        <li key={option.id}>
          <button
            type="button"
            onClick={() => onSelect?.(option.id)}
            className={cn(
              "w-full py-1 text-left text-sm text-stone-600 transition-colors hover:text-emerald-700",
              selectedId === option.id && "font-medium text-emerald-700"
            )}
          >
            {option.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ProductFilterSidebar({
  categories,
  productTypes,
  origins,
  colors,
  selectedCategoryId,
  onSelectCategory,
  selectedProductTypeId,
  onSelectProductType,
  selectedOriginId,
  onSelectOrigin,
  selectedColorId,
  onSelectColor,
}: IProductFilterSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="w-full max-w-xs rounded-lg border border-stone-200 bg-white">
      <Accordion
        // type="multiple"
        defaultValue={["stoneType"]}
        className="divide-y divide-stone-100"
      >
        <AccordionItem value="stoneType" className="px-4">
          <AccordionTrigger className="text-base font-semibold text-stone-900">
            {t("filters.stoneType", "Вид камня")}
          </AccordionTrigger>
          <AccordionContent>
            {categories.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                depth={0}
                selectedId={selectedCategoryId}
                onSelect={onSelectCategory}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="productType" className="px-4">
          <AccordionTrigger className="text-base font-semibold text-stone-900">
            {t("filters.productType", "Изделие")}
          </AccordionTrigger>
          <AccordionContent>
            <FlatFilterList
              options={productTypes}
              selectedId={selectedProductTypeId}
              onSelect={onSelectProductType}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="origin" className="px-4">
          <AccordionTrigger className="text-base font-semibold text-stone-900">
            {t("filters.origin", "Месторождение")}
          </AccordionTrigger>
          <AccordionContent>
            <FlatFilterList
              options={origins}
              selectedId={selectedOriginId}
              onSelect={onSelectOrigin}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color" className="px-4">
          <AccordionTrigger className="text-base font-semibold text-stone-900">
            {t("filters.color", "Цвет")}
          </AccordionTrigger>
          <AccordionContent>
            <FlatFilterList
              options={colors}
              selectedId={selectedColorId}
              onSelect={onSelectColor}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}

export default ProductFilterSidebar;
