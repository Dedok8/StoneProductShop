import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { getMenuItems, selectAuthUser } from "@/shared";
import { HeaderNavLink } from "@/widgets/Header/Header-nav-link";

interface HeaderNavProps {
  mobile?: boolean;
  onLinkClick?: () => void;
}

function HeaderNav({ mobile = false, onLinkClick }: HeaderNavProps) {
  const user = useSelector(selectAuthUser);
  const { t } = useTranslation();

  const allowedRoutes = getMenuItems({
    isAuthenticated: !!user,
    userRole: user?.role,
  });

  return (
    <nav
      className={
        mobile
          ? "flex flex-col gap-4"
          : "flex flex-wrap gap-6 md:gap-10 lg:gap-16 xl:gap-30 justify-end"
      }
    >
      {allowedRoutes.map(({ path, title }) => (
        <HeaderNavLink key={path} to={path} onClick={onLinkClick}>
          {t(title)}
        </HeaderNavLink>
      ))}
    </nav>
  );
}

export { HeaderNav };
