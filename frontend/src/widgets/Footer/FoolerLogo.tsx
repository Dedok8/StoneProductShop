import { Link } from "react-router-dom";

import Logo from "@/assets/logo/logo.svg?react";

function FooterLogo() {
  return (
    <Link to="/" className="flex shrink-0" aria-label="Home">
      <Logo className="w-[140px] h-auto sm:w-[160px] lg:w-[175px]" />
    </Link>
  );
}

export default FooterLogo;
