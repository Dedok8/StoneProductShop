import { useTranslation } from "react-i18next";

import { useGetAllInspiration } from "@/features/inspiration/getAllInspiration/model";
import { useQueryState } from "@/shared";

function GetAllInspiration() {
  const { inspirations, isLoading, error, isError, refetch } =
    useGetAllInspiration();
  const { t } = useTranslation();

  const queryState = useQueryState(isLoading, isError, error);
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

      {queryState}
    </div>
  );
}

export default GetAllInspiration;
