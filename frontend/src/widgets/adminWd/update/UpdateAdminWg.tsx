import { Link } from "react-router-dom";

import { FRONT_ROUTES } from "@/shared";
import { Card, CardContent } from "@/shared/ui/components/card";

function UpdateAdminWg({ orderId }: { orderId: string }) {
  return (
    <Card>
      <CardContent>
        <h2>Users</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.UpdateOrder.path(orderId)}>
            Update status order
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpdateAdminWg;
