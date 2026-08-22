import { Link } from "react-router-dom";

import Logo from "@/assets/logo/logo.svg?react";

function HeaderLogo() {
  return (
    <Link to="/" className="flex items-center shrink-0" aria-label="Home">
      <Logo className="w-[120px] h-auto sm:w-[140px] md:w-[155px] lg:w-[175px]" />
    </Link>
  );
}

export { HeaderLogo };
