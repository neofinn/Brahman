// Stand-in for next/link in the single-file beta.
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { navigate, pathToToken } from "../router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; children?: ReactNode };

export default function Link({ href, onClick, children, ...rest }: Props) {
  const external = /^[a-z]+:/i.test(href);
  if (external) return <a href={href} {...rest}>{children}</a>;
  return (
    <a
      {...rest}
      href={`#${pathToToken(href.split("?")[0])}`}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
