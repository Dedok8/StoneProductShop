import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/components/accordion";
import { Button } from "@/shared/ui/components/button";

interface IFilterItem {
  id: string;
  name: string;
}

interface IProductAsideFilterProps {
  category: IFilterItem[];
  categoryId?: string;
  onSelectCategoryId?: (id: string) => void;

  productType: IFilterItem[];
  productTypeId?: string | null;
  onSelectProductTypeId?: (id: string) => void;

  productColor: IFilterItem[];
  productColorId?: string | null;
  onSelectProductColorId?: (id: string) => void;

  productOrigin: IFilterItem[];
  productOriginId?: string | null;
  onSelectProductOriginId?: (id: string) => void;
}

interface IProductAsideListProps {
  items: IFilterItem[];
  selectId?: string | null;
  onSelectId?: (id: string) => void;
}

function ProductAsideList({
  items,
  onSelectId,
  selectId,
}: IProductAsideListProps) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <Button
            type="button"
            onClick={() => onSelectId?.(item.id)}
            className={
              item.id === selectId ? "font-medium text-emerald-700" : ""
            }
          >
            {item.name}
          </Button>
        </li>
      ))}
    </ul>
  );
}

function ProductAsideFilter({
  category,
  categoryId,
  onSelectCategoryId,

  productType,
  productTypeId,
  onSelectProductTypeId,

  productColor,
  productColorId,
  onSelectProductColorId,

  productOrigin,
  productOriginId,
  onSelectProductOriginId,
}: IProductAsideFilterProps) {
  const { t } = useTranslation();
  return (
    <aside>
      <Accordion defaultValue={[""]}>
        <AccordionItem value="categories">
          <AccordionTrigger>{t("filter.category")}</AccordionTrigger>
          <AccordionContent>
            <ProductAsideList
              items={category}
              selectId={categoryId}
              onSelectId={onSelectCategoryId}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="stoneType">
          <AccordionTrigger>{t("filter.stoneType")}</AccordionTrigger>
          <AccordionContent>
            <ProductAsideList
              items={productType}
              selectId={productTypeId}
              onSelectId={onSelectProductTypeId}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="color">
          <AccordionTrigger>{t("filter.color")}</AccordionTrigger>
          <AccordionContent>
            <ProductAsideList
              items={productColor}
              selectId={productColorId}
              onSelectId={onSelectProductColorId}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="origin">
          <AccordionTrigger>{t("filter.origin")}</AccordionTrigger>
          <AccordionContent>
            <ProductAsideList
              items={productOrigin}
              selectId={productOriginId}
              onSelectId={onSelectProductOriginId}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}

export default ProductAsideFilter;
