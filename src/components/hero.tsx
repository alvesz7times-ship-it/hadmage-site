import { ArrowRight, Terminal } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { useNav } from "@/components/nav-context";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "11", label: "membros" },
  { value: "1", label: "bolha privada" },
  { value: "∞", label: "áreas da net" },
];

export function Hero() {
  const { go } = useNav();

  return (
    <section className="relative panel-enter">
      <div className="relative mx-auto flex w-[min(1120px,92%)] flex-col items-center px-1 pb-20 pt-16 text-center md:pt-20">
        <div className="stagger-item relative">
          <LogoMark className="size-36 shadow-[var(--shadow-glow)] md:size-44" />
        </div>

        <p className="stagger-item mt-8 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary-hot">
          <Terminal className="size-3.5" />
          Grupo privado · hackers éticos
        </p>

        <h1 className="stagger-item display mt-5 max-w-[22ch] text-[clamp(2.1rem,6vw,4.2rem)] font-semibold leading-[1.08] tracking-wide text-primary-hot">
          Amigos, ética e conhecimento na internet
        </h1>

        <p className="stagger-item mt-5 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg">
          A HADMAGE é um círculo fechado de amigos vinculado à bolha no WhatsApp —
          para trocar conhecimento, técnicas e ideias com responsabilidade.
        </p>

        <div className="stagger-item mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => go("membros")} className="pl-6 pr-5">
            Ver membros
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => go("quem-somos")}>
            Quem somos
          </Button>
        </div>

        <dl className="stagger-item mt-14 grid w-full max-w-xl grid-cols-3 gap-3 border-t border-primary/20 pt-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="display text-2xl font-semibold tabular-nums text-fg md:text-3xl">
                {stat.value}
              </dd>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </div>
      <div className="hero-scan" aria-hidden="true" />
    </section>
  );
}
