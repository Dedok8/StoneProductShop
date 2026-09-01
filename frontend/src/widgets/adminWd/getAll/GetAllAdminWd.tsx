import { Link } from "react-router-dom";

import { FRONT_ROUTES } from "@/shared";
import { Card, CardContent } from "@/shared/ui/components/card";

function GetAllAdminWd() {
  return (
    <Card>
      <CardContent>
        <h2>Users</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.AllUsers.path}>All users</Link>
        </div>
      </CardContent>

      <CardContent>
        <h2>Category</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.AllCategory.path}>All Category</Link>
        </div>
      </CardContent>
      <CardContent>
        <h2>Product</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.Catalog.path}>All Product</Link>
        </div>
      </CardContent>
      <CardContent>
        <h2>Orders</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.AllOrders.path}>All Orders</Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default GetAllAdminWd;
