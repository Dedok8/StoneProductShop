import { Outlet } from "react-router";

import { selectAuthLoading } from "@/features/auth/api";
import { useAppSelector } from "@/shared/hooks/useSelector";
import { PageLoader } from "@/shared/ui/PageLoader/PageLoader";

export default function RootLayout() {
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading) return <PageLoader />;

  return <Outlet />;
}
