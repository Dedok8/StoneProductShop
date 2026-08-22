import { useTranslation } from "react-i18next";

import { FOOTER_SECTIONS } from "@/shared";
import { FooterNavLink } from "@/widgets/Footer/FooterNavLink";

function FooterNav() {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:gap-10 md:gap-14">
      {FOOTER_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">{t(section.title)}</h3>
          {section.links.map((link) => (
            <FooterNavLink key={link.path} to={link.path}>
              {t(link.title)}
            </FooterNavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default FooterNav;
