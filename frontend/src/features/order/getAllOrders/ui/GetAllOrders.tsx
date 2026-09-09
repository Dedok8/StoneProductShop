import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetAllOrders } from "@/features/order/getAllOrders/model";
import UpdateOrderStatus from "@/features/order/updateOrderStatus/ui/UpdateOrderStatus";
import { useQueryState, useUser } from "@/shared";
import type { IGetOrdersQuery } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

const GRID_COLS = "grid-cols-[2fr_1.5fr_1fr]";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const selectClass =
  "rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function GetAllOrders() {
  const [query, setQuery] = useState<IGetOrdersQuery>({
    page: 1,
    limit: 20,
    sortOrder: "desc",
  });

  const user = useUser();

  const { orders, meta, isLoading, error, isError, isFetching, refetch } =
    useGetAllOrders(query);

  const { t } = useTranslation();

  const queryState = useQueryState(isLoading, isError, error);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("order.status.label", "Status")}
          </label>
          <select
            value={query.status ?? ""}
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                status: (e.target.value ||
                  undefined) as IGetOrdersQuery["status"],
                page: 1,
              }))
            }
            className={selectClass}
          >
            <option value="">{t("order.allStatuses")}</option>
            <option value="PENDING">{t("order.status.pending")}</option>
            <option value="PAID">{t("order.status.paid")}</option>
            <option value="SHIPPED">{t("order.status.shipped")}</option>
            <option value="COMPLETED">{t("order.status.completed")}</option>
            <option value="CANCELLED">{t("order.status.cancelled")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("common.sort", "Sort")}
          </label>
          <select
            value={query.sortOrder}
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                sortOrder: e.target.value as IGetOrdersQuery["sortOrder"],
              }))
            }
            className={selectClass}
          >
            <option value="asc">{t("common.asc")}</option>
            <option value="desc">{t("common.desc")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("order.dateFrom", "From")}
          </label>
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("order.dateTo", "To")}
          </label>
          <Input
            type="date"
            value={query.dateTo ?? ""}
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                dateTo: e.target.value || undefined,
              }))
            }
          />
        </div>

        <button
          onClick={refetch}
          className="ml-auto flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {t("common.refresh")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div
          className={`grid ${GRID_COLS} gap-4 border-b bg-muted/50 px-4 py-3 text-left text-sm font-medium text-muted-foreground`}
        >
          <div>{t("order.id", "Order")}</div>
          <div>{t("order.status.label", "Status")}</div>
          <div>{t("order.total", "Total")}</div>
        </div>

        <div className="divide-y">
          {orders?.map((order) => (
            <div
              key={order.id}
              className={`grid ${GRID_COLS} items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/40`}
            >
              <div className="truncate font-mono text-xs text-muted-foreground">
                {order.id}
              </div>
              <div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[order.status] ?? "bg-muted text-foreground"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="font-medium text-foreground">{order.total} $</div>
              {user?.role === "ADMIN" && <UpdateOrderStatus order={order} />}
            </div>
          ))}
        </div>

        {orders?.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t("common.noResults")}
          </div>
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {query.page} / {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!query.page || query.page <= 1}
              onClick={() =>
                setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
              }
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              disabled={
                query.page === undefined || query.page >= meta.totalPages
              }
              onClick={() =>
                setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
              }
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}

      {queryState}
    </div>
  );
}

export default GetAllOrders;
