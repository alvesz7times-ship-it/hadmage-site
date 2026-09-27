export type TabId =
  | "inicio"
  | "quem-somos"
  | "membros"
  | "delavy"
  | "trofeus"
  | "denuncia";

export const TABS: { id: TabId; label: string }[] = [
  { id: "inicio", label: "Início" },
  { id: "quem-somos", label: "Quem somos" },
  { id: "membros", label: "Membros" },
  { id: "delavy", label: "Delavy" },
  { id: "trofeus", label: "Troféus" },
];

/** Hash legado #denuncia continua válido e aponta para a aba Delavy (contato junto). */
export function isTabId(value: string): value is TabId {
  return TABS.some((tab) => tab.id === value) || value === "denuncia";
}

export function normalizeTab(value: string): TabId {
  if (value === "denuncia") return "delavy";
  return isTabId(value) ? value : "inicio";
}
