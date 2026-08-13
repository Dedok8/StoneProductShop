import { HeaderContacts } from "@/widgets/Header/Header-contacts";
import { HeaderLogo } from "@/widgets/Header/Header-logo";
import { HeaderNav } from "@/widgets/Header/Header-nav";

function Header() {
  return (
    <header className="bg-accent-foreground">
      <div className="flex justify-between pt-5 pl-5 pr-5">
        <HeaderLogo />

        <div className="flex flex-col">
          <HeaderContacts />
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}

export default Header;
