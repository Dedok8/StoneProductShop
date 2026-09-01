import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFindProductById } from "@/features/product/findProductById";
import { useUpdateProduct } from "@/features/product/updateProduct/model/useUpdateProduct";
import type { IProductResponse } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

function UpdateProduct() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  console.log("id from params:", id);
  const { product, isLoading: isProductLoading } = useFindProductById(id);

  if (isProductLoading || !product) return <div>{t("common.loading")}</div>;

  return <UpdateProductForm product={product} />;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function UpdateProductForm({ product }: { product: IProductResponse }) {
  const { updateProduct, isLoading, error, isError } = useUpdateProduct();
  const { t } = useTranslation();

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [images, setImages] = useState(product.images);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [stock, setStock] = useState(product.stock);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [isActive, setIsActive] = useState<boolean>(product.isActive);

  const isChanged =
    name !== product.name ||
    slug !== product.slug ||
    description !== product.description ||
    price !== product.price ||
    stock !== product.stock ||
    categoryId !== product.categoryId ||
    isActive !== product.isActive ||
    images.length !== product.images.length ||
    images.some((url, i) => url !== product.images[i]);

  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (images.length >= 10) return;
    setImages((prev) => [...prev, url]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProduct: React.SubmitEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();

    if (!isChanged) return;

    const changes: Partial<{
      name: string;
      slug: string;
      description: string;
      price: number;
      stock: number;
      categoryId: string;
      isActive: boolean;
      images: string[];
    }> = {};

    if (name !== product.name) changes.name = name;
    if (slug !== product.slug) changes.slug = slug;
    if (description !== product.description) changes.description = description;
    if (price !== product.price) changes.price = price;
    if (stock !== product.stock) changes.stock = stock;
    if (categoryId !== product.categoryId) changes.categoryId = categoryId;
    if (isActive !== product.isActive) changes.isActive = isActive;
    if (
      images.length !== product.images.length ||
      images.some((url, i) => url !== product.images[i])
    ) {
      changes.images = images;
    }

    try {
      await updateProduct(product.id, changes);
    } catch (e) {
      //
    }
  };

  return (
    <form
      onSubmit={handleUpdateProduct}
      className="mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t("product.editTitle", "Edit product")}
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          {t("product.active", "Active")}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("product.name", "Name")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label={t("product.slug", "Slug")}>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>

        <Field label={t("product.price", "Price")}>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </Field>

        <Field label={t("product.stock", "Stock")}>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </Field>

        <Field label={t("product.category", "Category")}>
          <Input
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
        </Field>
      </div>

      <Field label={t("product.description", "Description")}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {t("product.images", "Images")}
          </span>
          <span className="text-xs text-muted-foreground">
            {images.length}/10
          </span>
        </div>

        {images.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={t("common.remove")}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder={t("product.imageUrlPlaceholder")}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddImage}
            disabled={images.length >= 10}
          >
            <Plus className="mr-1 h-4 w-4" />
            {t("common.add")}
          </Button>
        </div>
      </div>

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error?.toString()}
        </p>
      )}

      <Button
        type="submit"
        disabled={!isChanged || isLoading}
        className="ml-auto"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("save")}
      </Button>
    </form>
  );
}

export default UpdateProduct;
