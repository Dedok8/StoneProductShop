import { GetMe } from "@/features";
import Logout from "@/features/auth/logout/ui/Logout";
import GetCart from "@/features/cart/getCart/ui/GetCart";
import Checkout from "@/features/order/checkout/ui/Checkout";
import { useUser } from "@/shared";
import CreateAdminWd from "@/widgets/adminWd/create";
import GetAllAdminWd from "@/widgets/adminWd/getAll/GetAllAdminWd";

function ProfilePage() {
  const user = useUser();
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <GetMe />
      {user?.role === "ADMIN" && (
        <>
          <CreateAdminWd />
          <GetAllAdminWd />
          {/* <UpdateAdminWg orderId="" /> */}
        </>
      )}
      <Logout />
      <GetCart />
      <Checkout />
    </div>
  );
}

export default ProfilePage;
