import { useTranslation } from "react-i18next";

import { useGetAllInspiration } from "@/features/inspiration/getAllInspiration/model";
import { getApiErrorMessage } from "@/shared";

function GetAllInspiration() {
  const { inspirations, isLoading, error, isError, refetch } =
    useGetAllInspiration();
  const { t } = useTranslation();

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;
  return (
    <div>
      <button type="button" onClick={refetch}>
        {t("common.refresh")}
      </button>

      {inspirations.length === 0 ? (
        <p>{t("inspiration.notFound")}</p>
      ) : (
        <ul>
          {inspirations.map((inspiration) => (
            <li key={inspiration.id}>
              <h3>{inspiration.imageUrl}</h3>
              <p>{inspiration.alt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GetAllInspiration;
