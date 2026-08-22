import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { HeaderContacts } from "@/widgets/Header/Header-contacts";
import { HeaderLogo } from "@/widgets/Header/Header-logo";
import { HeaderNav } from "@/widgets/Header/Header-nav";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    if (isOpen) {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="bg-accent-foreground relative z-50">
      <div className="flex justify-between items-center px-4 py-4 sm:px-6 md:px-8 lg:px-10 lg:py-5">
        <HeaderLogo />

        <div className="hidden lg:flex lg:flex-col">
          <HeaderContacts />
          <HeaderNav />
        </div>

        <button
          type="button"
          className="lg:hidden text-background p-2"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <HugeiconsIcon icon={isOpen ? Cancel01Icon : Menu01Icon} size={24} />
        </button>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-6 px-4 pb-6 sm:px-6 md:px-8 border-t border-background/20">
          <div className="pt-4">
            <HeaderNav mobile onLinkClick={() => setIsOpen(false)} />
          </div>
          <HeaderContacts mobile />
        </div>
      </div>
    </header>
  );
}

export default Header;
