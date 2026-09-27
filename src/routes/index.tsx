import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { About } from "@/components/about";
import { Atmosphere } from "@/components/atmosphere";
import { Hero } from "@/components/hero";
import { Delavy } from "@/components/delavy";
import { Members } from "@/components/members";
import { NavProvider } from "@/components/nav-context";
import { Report } from "@/components/report";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Trophies } from "@/components/trophies";
import { normalizeTab, type TabId } from "@/lib/nav";

export const Route = createFileRoute("/")({ component: Home });

function readHash(): TabId {
  if (typeof window === "undefined") return "inicio";
  const value = window.location.hash.replace("#", "");
  return normalizeTab(value);
}

function Home() {
  const [tab, setTab] = useState<TabId>("inicio");

  useEffect(() => {
    setTab(readHash());
    const onHash = () => setTab(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((id: TabId) => {
    const nextId = id === "denuncia" ? "delavy" : id;
    setTab(nextId);
    const next = `#${nextId}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <NavProvider value={{ tab, go }}>
      <Atmosphere />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {tab === "inicio" ? <Hero /> : null}
          {tab === "quem-somos" ? <About /> : null}
          {tab === "membros" ? <Members /> : null}
          {tab === "delavy" ? (
            <>
              <Delavy />
              <Report variant="delavy" />
            </>
          ) : null}
          {tab === "trofeus" ? <Trophies /> : null}
        </main>
        <SiteFooter />
      </div>
    </NavProvider>
  );
}
