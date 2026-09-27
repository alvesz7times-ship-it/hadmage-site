import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/logo-mark";
import { useNav } from "@/components/nav-context";
import { Button } from "@/components/ui/button";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { tab, go } = useNav();
  const [open, setOpen] = useState(false);

  function navigate(id: (typeof TABS)[number]["id"]) {
    go(id);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/30 bg-bg/78 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-[min(1120px,92%)] items-center justify-between gap-5">
        <button
          type="button"
          className="flex min-h-11 items-center gap-3 text-left"
          onClick={() => navigate("inicio")}
        >
          <LogoMark className="size-12 shadow-[var(--shadow-glow)]" />
          <span className="brand-word text-[1.55rem] leading-none text-primary-hot">
            Had<span className="text-primary-hot/80">mage</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Navegação principal">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={cn(
                  "h-10 rounded-full px-4 text-sm font-medium transition-[color,background-color,border-color] duration-150",
                  active
                    ? "border border-primary bg-primary/25 text-fg"
                    : "border border-transparent text-muted hover:text-fg",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-b border-border bg-bg/96 md:hidden",
          "transition-[max-height,opacity] duration-200 ease-out",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-[4%] py-3" aria-label="Menu móvel">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={cn(
                  "min-h-11 rounded-md px-3.5 text-left text-sm font-medium",
                  active ? "bg-primary/20 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
