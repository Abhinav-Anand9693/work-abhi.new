export function notFound(): never {
  throw new Error("Page not found");
}

export function useRouter() {
  return {
    push: (href: string) => {
      window.dispatchEvent(new CustomEvent("workabhi-navigate", { detail: { href } }));
    },
    replace: (href: string) => {
      window.dispatchEvent(new CustomEvent("workabhi-navigate", { detail: { href, replace: true } }));
    },
    back: () => {
      window.history.back();
    },
    forward: () => {
      window.history.forward();
    },
    refresh: () => {
      window.location.reload();
    },
  };
}

export function usePathname(): string {
  return window.location.pathname;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}
