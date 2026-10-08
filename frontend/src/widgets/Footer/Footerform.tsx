import roomBg from "@/assets/footer/footerBg.png";
import CreateLead from "@/features/lead/createLead/ui/CreateLead";

function FooterForm() {
  return (
    <div
      className="relative bg-black bg-cover bg-right bg-no-repeat px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-24"
      style={{ backgroundImage: `url(${roomBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20 sm:via-black/70 sm:to-black/10" />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20 sm:via-black/70 sm:to-black/10" />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-4 lg:mx-0">
        <h2 className="text-xl font-bold uppercase text-white sm:text-2xl lg:text-3xl">
          Do you have any questions?
        </h2>
        <h3 className="text-lg font-bold uppercase text-white sm:text-xl lg:text-2xl">
          Contact us—we'll help you!
        </h3>
        <p className="text-sm text-gray-400 sm:text-base">
          Please fill out the form, and we will contact you shortly.
        </p>

        <CreateLead />
      </div>
    </div>
  );
}

export default FooterForm;
