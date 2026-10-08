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
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Профиль</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Аккаунт, корзина и заказы в одном месте
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Левая колонка: аккаунт */}
          <div className="md:col-span-1 space-y-6">
            <section className="rounded-lg border border-input bg-background p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Аккаунт
              </h2>
              <GetMe />
              <div className="mt-5 border-t border-input pt-4">
                <Logout />
              </div>
            </section>
          </div>

          {/* Правая колонка: корзина и заказ */}
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-lg border border-input bg-background p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Корзина
              </h2>
              <GetCart />
            </section>

            <section className="rounded-lg border border-input bg-background p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Оформление заказа
              </h2>
              <Checkout />
            </section>
          </div>
        </div>

        {/* Админ-зона: визуально отделена */}
        {user?.role === "ADMIN" && (
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-sm font-medium text-foreground">
                Администрирование
              </h2>
              <span className="rounded-full border border-input px-2 py-0.5 text-xs text-muted-foreground">
                admin
              </span>
            </div>
            <div className="space-y-6 rounded-lg border border-dashed border-input p-5">
              <CreateAdminWd />
              <GetAllAdminWd />
              {/* <UpdateAdminWg orderId="" /> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
