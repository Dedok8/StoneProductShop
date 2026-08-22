import { cva, type VariantProps } from "class-variance-authority";
import { Link, type LinkProps } from "react-router-dom";

import { cn } from "@/shared";

const footerLinkVariants = cva(
  "text-[16px] font-normal text-muted-foreground transition-colors duration-200 ease-out hover:text-background flex"
);

interface FooterLinkProps
  extends Omit<LinkProps, "className">,
    VariantProps<typeof footerLinkVariants> {
  className?: string;
}

function FooterNavLink({ className, ...props }: FooterLinkProps) {
  return <Link {...props} className={cn(footerLinkVariants(), className)} />;
}

export { FooterNavLink };
