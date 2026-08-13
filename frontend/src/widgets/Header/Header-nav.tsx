import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { getMenuItems, selectAuthUser } from "@/shared";
import { HeaderNavLink } from "@/widgets/Header/Header-nav-link";

function HeaderNav() {
  const user = useSelector(selectAuthUser);
  const { t } = useTranslation();

  const allowedRoutes = getMenuItems({
    isAuthenticated: !!user,
    userRole: user?.role,
  });

  return (
    <nav className="flex gap-30">
      {allowedRoutes.map(({ path, title }) => (
        <HeaderNavLink key={path} to={path}>
          {t(title)}
        </HeaderNavLink>
      ))}
    </nav>
  );
}

export { HeaderNav };
