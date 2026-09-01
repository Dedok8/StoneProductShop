import { Link } from "react-router-dom";

import { FRONT_ROUTES } from "@/shared";
import { Card, CardContent } from "@/shared/ui/components/card";

function CreateAdminWd() {
  return (
    <Card>
      <CardContent>
        <h2>Product</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.CreateProduct.path}>Create prod</Link>
        </div>
      </CardContent>

      <CardContent>
        <h2>Category</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.CreateCategory.path}>
            Create category
          </Link>
        </div>
      </CardContent>

      <CardContent>
        <h2>Image</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.CreateInspiration.path}>
            Create uploading
          </Link>
        </div>
      </CardContent>

      <CardContent>
        <h2>User</h2>
        <div>
          <Link to={FRONT_ROUTES.pages.CreateUser.path}>Create user</Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateAdminWd;
