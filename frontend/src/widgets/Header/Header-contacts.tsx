import { Call02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import Viber from "@/assets/icons/viber.svg?react";

interface HeaderContactsProps {
  mobile?: boolean;
}

function HeaderContacts({ mobile = false }: HeaderContactsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={
        mobile
          ? "flex flex-col gap-4 text-background"
          : "flex items-center pb-4 lg:pb-8 justify-end gap-4 md:gap-6 text-background flex-wrap"
      }
    >
      <NavLink
        to={"viber://chat?number=%2B0000000000"}
        aria-label="Viber"
        className="flex items-center gap-2"
      >
        <Viber className="h-4 w-4 shrink-0" />
        {mobile && <span className="text-sm">Viber</span>}
      </NavLink>

      <NavLink to={"tel:+00000000000"} className="flex items-center gap-2">
        <HugeiconsIcon icon={Call02Icon} size={16} className="shrink-0" />
        <span className="text-sm sm:text-base whitespace-nowrap">
          0-000-00000
        </span>
      </NavLink>

      <button
        type="button"
        aria-label={t("common.search")}
        className="flex items-center gap-2"
      >
        <HugeiconsIcon icon={Search01Icon} size={16} className="shrink-0" />
        {mobile && <span className="text-sm">{t("common.search")}</span>}
      </button>
    </div>
  );
}

export { HeaderContacts };
