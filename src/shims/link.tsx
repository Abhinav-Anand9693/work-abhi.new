import React from "react";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, children, className, onClick, ...props }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (!e.defaultPrevented && href && !href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("#") && !href.startsWith("mailto:")) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("workabhi-navigate", { detail: { href } }));
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
