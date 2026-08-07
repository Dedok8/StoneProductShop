import { useTranslation } from "react-i18next";

import { useGetAllCategory } from "@/features/category/getAllCategory/model";
import { getApiErrorMessage } from "@/shared/ui/Error";

function GetAllCategory() {
  const { categories, isLoading, error, isError, refetch } =
    useGetAllCategory();

  const { t } = useTranslation();

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <button onClick={refetch}>{t("common.refresh")}</button>

      {categories.length === 0 ? (
        <p>{t("category.notFound")}</p>
      ) : (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <h3>{category.name}</h3>
              <p>{category.slug}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GetAllCategory;
