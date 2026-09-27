import { createContext, useContext, type ReactNode } from "react";
import type { TabId } from "@/lib/nav";

type NavValue = {
  tab: TabId;
  go: (id: TabId) => void;
};

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({
  value,
  children,
}: {
  value: NavValue;
  children: ReactNode;
}) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside NavProvider");
  return ctx;
}
