import { Eye, FileSearch, HeartHandshake, Shield } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { useNav } from "@/components/nav-context";
import { Button } from "@/components/ui/button";
import { RESOURCES, STEPS } from "@/data/content";

const POINTS = [
  {
    icon: Eye,
    text: "Grupo privado de amigos — hackers éticos",
  },
  {
    icon: FileSearch,
    text: "Compartilhamos conhecimento em diversas áreas da internet",
  },
  {
    icon: HeartHandshake,
    text: "Vinculados à bolha no WhatsApp, fora do grupo público",
  },
  {
    icon: Shield,
    text: "Ética em primeiro lugar: aprender, experimentar e proteger",
  },
];

export function About() {
  const { go } = useNav();

  return (
    <section className="panel-enter mx-auto w-[min(1120px,92%)] py-12 md:py-16">
      <div className="grid items-start gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div className="flex justify-center md:sticky md:top-28">
          <LogoMark className="size-48 shadow-[var(--shadow-glow)] md:size-64" />
        </div>

        <div>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
            O grupo
          </p>
          <h2 className="display mt-2 text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-tight text-primary-hot">
            Quem somos nós
          </h2>
          <div className="mt-5 space-y-4 text-[0.98rem] leading-relaxed text-muted">
            <p>
              A <strong className="font-medium text-fg">HADMAGE</strong> é um grupo
              privado de amigos —{" "}
              <strong className="font-medium text-fg">hackers éticos</strong> —
              vinculado à nossa bolha no WhatsApp.
            </p>
            <p>
              Diferente do nosso grupo público e o resto da comunidade{" "}
              <em className="text-fg">Ilha Hadmage</em>, a HADMAGE existe para
              compartilhar conhecimentos entre amigos, abrangendo diversas áreas da
              internet: segurança, OSINT, desenvolvimento, redes e muito mais.
            </p>
          </div>

          <ul className="mt-7 grid gap-3">
            {POINTS.map((point) => (
              <li
                key={point.text}
                className="flex items-start gap-3 rounded-lg border border-border bg-bg-elevated/80 px-4 py-3.5"
              >
                <point.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm leading-snug text-fg/90">{point.text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-lg border-l-2 border-primary bg-surface/80 px-4 py-3 text-sm leading-relaxed text-muted">
            Não somos um grupo público nem um serviço de denúncias. Somos um círculo
            fechado de amigos que estudam e praticam hacking ético com responsabilidade.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button onClick={() => go("membros")}>Conhecer a equipe</Button>
            <Button variant="outline" onClick={() => go("trofeus")}>
              Ver marcos
            </Button>
            <Button variant="outline" onClick={() => go("delavy")}>
              Falar com a gente
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <article
            key={step.n}
            className="rounded-xl border border-border bg-bg-elevated/70 p-5"
          >
            <p className="display text-xl text-primary">{step.n}</p>
            <h3 className="mt-3 text-base font-medium text-fg">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {RESOURCES.map((res) => (
          <a
            key={res.name}
            href={res.href}
            target={res.href.startsWith("http") ? "_blank" : undefined}
            rel={res.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="rounded-xl border border-border bg-surface/60 px-4 py-4 transition-[border-color,background-color] duration-150 hover:border-primary/50 hover:bg-primary/10"
          >
            <p className="text-sm font-medium text-fg">{res.name}</p>
            <p className="mt-1 text-xs text-muted">{res.detail}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
