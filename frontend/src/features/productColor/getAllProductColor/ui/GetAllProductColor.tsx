import { FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import DeleteProductColor from "@/features/productColor/deleteProductColor/ui/DeleteProductColor";
import { useGetAllProductColor } from "@/features/productColor/getAllProductColor/model";
import { FRONT_ROUTES, useQueryState, useUser } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent } from "@/shared/ui/components/card";
import EmptyComp from "@/shared/ui/getAll/EmptyComp";
import EntityGridMap from "@/shared/ui/getAll/EntityGridMap";
import ListHeaderComp from "@/shared/ui/getAll/ListHeaderComp";

function GetAllProductColor() {
  const { productColor, isLoading, error, isError, refetch } =
    useGetAllProductColor();
  const user = useUser();

  const { t } = useTranslation();

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <Card>
      <CardContent>
        <ListHeaderComp
          title={t("productColor.title")}
          onRefetch={refetch}
          refetchLabel={t("common.refresh")}
        />

        {productColor.length === 0 ? (
          <EmptyComp icon={FolderOpen} message={t("productColor.notFound")} />
        ) : (
          <EntityGridMap
            items={productColor}
            getKey={(pc) => pc.id}
            renderItem={(pc) => (
              <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
                <span
                  className="h-6 w-6 shrink-0 rounded-full border"
                  style={{ backgroundColor: pc.hex }}
                />
                <span className="font-medium text-foreground">{pc.name}</span>
                {user?.role === "ADMIN" && (
                  <>
                    <DeleteProductColor colorId={pc.id} />
                    <Link
                      to={FRONT_ROUTES.pages.UpdateProductColor.path(pc.id)}
                    >
                      <Button>{t("common.edit")}</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          />
        )}
      </CardContent>
      {queryState}
    </Card>
  );
}

export default GetAllProductColor;
