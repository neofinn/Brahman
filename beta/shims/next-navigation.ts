// Stand-in for next/navigation in the single-file beta.
import { navigate, useLocation } from "../router";

export function usePathname(): string {
  return useLocation().path;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

export function useRouter() {
  return { push: navigate, replace: navigate, back: () => history.back(), refresh: () => undefined };
}

export class NotFound extends Error {}

export function notFound(): never {
  throw new NotFound("Not found");
}
