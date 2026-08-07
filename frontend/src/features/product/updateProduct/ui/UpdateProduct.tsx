import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFindProductById } from "@/features/product/findProductById";
import { useUpdateProduct } from "@/features/product/updateProduct/model/useUpdateProduct";
import type { IProductResponse } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

function UpdateProduct() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { product, isLoading: isProductLoading } = useFindProductById(id);

  if (isProductLoading || !product) return <div>{t("common.loading")}</div>;

  return <UpdateProductForm product={product} />;
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
    <form onSubmit={handleUpdateProduct}>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      <Input
        type="number"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
      />
      <Input
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      />
      <Input
        type="checkbox"
        checked={isActive}
        onChange={(e) => setIsActive(e.target.checked)}
      />

      <div>
        <ul>
          {images.map((url, index) => (
            <li key={`${url}-${index}`}>
              <img src={url} alt="" width={60} height={60} />
              <span>{url}</span>
              <Button type="button" onClick={() => handleRemoveImage(index)}>
                {t("common.remove")}
              </Button>
            </li>
          ))}
        </ul>

        <Input
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder={t("product.imageUrlPlaceholder")}
        />
        <Button
          type="button"
          onClick={handleAddImage}
          disabled={images.length >= 10}
        >
          {t("common.add")}
        </Button>
      </div>

      <Button type="submit" disabled={!isChanged || isLoading}>
        {t("save")}
      </Button>
      {isError && <p>{error?.toString()}</p>}
    </form>
  );
}

export default UpdateProduct;
