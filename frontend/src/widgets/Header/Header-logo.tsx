import { Link } from "react-router-dom";

import Logo from "@/assets/logo/logo.svg?react";

function HeaderLogo() {
  return (
    <Link to="/" className="" aria-label="Home">
      <Logo className="max-h-auto max-w-auto w-[100%]" />
    </Link>
  );
}

export { HeaderLogo };
