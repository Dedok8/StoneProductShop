import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetMyOrders } from "@/features/order/getMyOrders/model";
import type { IGetOrdersQuery } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function GetMyOrders() {
  const [query, setQuery] = useState<Omit<IGetOrdersQuery, "userId">>({
    page: 1,
    limit: 20,
    sortOrder: "desc",
  });

  const { orders, meta, isLoading, error, isError, isFetching, refetch } =
    useGetMyOrders(query);

  const { t } = useTranslation();

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <select
        value={query.status ?? ""}
        onChange={(e) =>
          setQuery((prev) => ({
            ...prev,
            status: (e.target.value || undefined) as IGetOrdersQuery["status"],
            page: 1,
          }))
        }
      >
        <option value="">{t("order.allStatuses")}</option>
        <option value="PENDING">{t("order.status.pending")}</option>
        <option value="PAID">{t("order.status.paid")}</option>
        <option value="SHIPPED">{t("order.status.shipped")}</option>
        <option value="COMPLETED">{t("order.status.completed")}</option>
        <option value="CANCELLED">{t("order.status.cancelled")}</option>
      </select>

      <select
        value={query.sortOrder}
        onChange={(e) =>
          setQuery((prev) => ({
            ...prev,
            sortOrder: e.target.value as IGetOrdersQuery["sortOrder"],
          }))
        }
      >
        <option value="asc">{t("common.asc")}</option>
        <option value="desc">{t("common.desc")}</option>
      </select>

      <Input
        type="date"
        value={query.dateFrom ?? ""}
        onChange={(e) =>
          setQuery((prev) => ({
            ...prev,
            dateFrom: e.target.value || undefined,
          }))
        }
      />
      <Input
        type="date"
        value={query.dateTo ?? ""}
        onChange={(e) =>
          setQuery((prev) => ({ ...prev, dateTo: e.target.value || undefined }))
        }
      />

      {isFetching && <div>{t("common.updating")}</div>}

      {orders?.length === 0 && <p>{t("order.empty")}</p>}

      <ul>
        {orders?.map((order) => (
          <li key={order.id}>
            <p>
              {t("order.id")}: {order.id}
            </p>
            <p>
              {t("order.status.label")}: {order.status}
            </p>
            <p>
              {t("order.total")}: {order.total}
            </p>
            <p>{new Date(order.createdAt).toLocaleString()}</p>

            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.price} = {item.subTotal}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {meta && (
        <div>
          <Button
            disabled={query.page === 1}
            onClick={() =>
              setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
            }
          >
            {t("common.previous")}
          </Button>
          <span>
            {query.page} / {meta.totalPages}
          </span>
          <Button
            disabled={query.page === meta.totalPages}
            onClick={() =>
              setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
            }
          >
            {t("common.next")}
          </Button>
        </div>
      )}

      <button onClick={() => refetch()}>{t("common.refresh")}</button>
    </div>
  );
}

export default GetMyOrders;
