import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/** Внутренние ссылки SPA работают через hash — это исключает 404 на GitHub Pages. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, ...props }, ref) => {
    const target = href.startsWith("/") ? `#${href}` : href;
    return (
      <a ref={ref} href={target} {...props}>
        {children}
      </a>
    );
  },
);
Link.displayName = "Link";
