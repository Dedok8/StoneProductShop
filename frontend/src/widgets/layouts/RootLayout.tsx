import { Outlet } from "react-router";

import { useSessionKeepAlive } from "@/features";

export default function RootLayout() {
  useSessionKeepAlive();

  return <Outlet />;
}
