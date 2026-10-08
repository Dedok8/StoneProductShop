import FooterLogo from "@/widgets/Footer/FoolerLogo";
import FooterContacts from "@/widgets/Footer/FooterContacts";
import FooterForm from "@/widgets/Footer/Footerform";
import FooterNav from "@/widgets/Footer/FooterNav";

function Footer() {
  return (
    <footer>
      <FooterForm />
      <div className="bg-foreground text-background flex flex-col gap-10 px-4 py-10 sm:px-6 md:px-8 md:py-16 lg:flex-row lg:justify-between lg:gap-8">
        <FooterLogo />
        <FooterNav />
        <FooterContacts />
      </div>
    </footer>
  );
}

export default Footer;
