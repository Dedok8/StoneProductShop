import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import Phone from "@/assets/icons/phone.svg?react";
import Search from "@/assets/icons/search.svg?react";
import Viber from "@/assets/icons/viber.svg?react";

function HeaderContacts() {
  const { t } = useTranslation();

  return (
    <div className="flex center pb-8 justify-end gap-6">
      <NavLink
        to={"viber://chat?number=%2B0000000000"}
        aria-label="Viber"
        className=""
      >
        <Viber className="h-5 w-5" />
      </NavLink>

      <NavLink to={"tel:+00000000000"} className="flex">
        <Phone className="h-5 w-5" />
        0-000-00000
      </NavLink>
      <button type="button" aria-label={t("common.search")} className="">
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}

export { HeaderContacts };
