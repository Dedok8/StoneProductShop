import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const CONTACT_PHONE = "+100000000";
const CONTACT_PHONE_DISPLAY = "(405) 555-01";
const CONTACT_EMAIL = "admin@example.com";

const SOCIAL_LINKS = [
  { Icon: FaFacebookF, url: "https://facebook.com", label: "Facebook" },
  { Icon: FaInstagram, url: "https://instagram.com", label: "Instagram" },
  { Icon: FaTwitter, url: "https://twitter.com", label: "Twitter" },
  { Icon: FaYoutube, url: "https://youtube.com", label: "YouTube" },
];

function FooterContacts() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold uppercase">
          Contact information
        </h2>
        <h4 className="text-sm font-normal">
          Phone: <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE_DISPLAY}</a>
        </h4>
        <h4 className="text-sm font-normal">
          Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {SOCIAL_LINKS.map(({ Icon, url, label }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="py-2 px-4 bg-accent-foreground rounded-lg transition-colors duration-200 ease-out hover:bg-chart-2"
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    </div>
  );
}

export default FooterContacts;
