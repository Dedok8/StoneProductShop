import { Outlet } from "react-router";

import { useSessionKeepAlive } from "@/features";
import Footer from "@/widgets/Footer/Footer";
import Header from "@/widgets/Header";

export default function RootLayout() {
  useSessionKeepAlive();

  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
