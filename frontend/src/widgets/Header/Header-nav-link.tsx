import { cva, type VariantProps } from "class-variance-authority";
import { NavLink, type NavLinkProps } from "react-router-dom";

import { cn } from "@/shared";

const navLinkVariants = cva(
  "text-[15px] sm:text-[16px] font-medium transition-colors hover:text-background duration-200 ease-out py-1 lg:py-0",
  {
    variants: {
      active: {
        true: "text-primary",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface HeaderNavLinkProps
  extends Omit<NavLinkProps, "className">,
    VariantProps<typeof navLinkVariants> {
  className?: string;
}

function HeaderNavLink({ className, ...props }: HeaderNavLinkProps) {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        cn(navLinkVariants({ active: isActive }), className)
      }
    />
  );
}

export { HeaderNavLink };
