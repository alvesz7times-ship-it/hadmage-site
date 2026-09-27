import { Check, Copy, MessageCircle, X } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { DELAVY, DELAVY_MEMBERS } from "@/data/content";
import { cn } from "@/lib/utils";

type Member = (typeof DELAVY_MEMBERS)[number];

function whatsappHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function Delavy() {
  const [active, setActive] = useState<Member | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyHandle(handle: string) {
    try {
      await navigator.clipboard.writeText(handle);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="delavy-layer panel-enter pb-16 pt-10">
      <div className="mx-auto flex w-[min(1120px,92%)] flex-col items-center text-center">
        <img
          src={DELAVY.logo}
          alt="Delavy"
          className="delavy-logo w-[min(320px,85%)] object-contain drop-shadow-[0_0_28px_rgba(200,210,220,0.35)]"
        />
        <p className="delavy-label mt-6 text-[0.72rem] font-medium uppercase tracking-[0.22em]">
          {DELAVY.tagline}
        </p>
        <h2 className="delavy-title display mt-2 text-[clamp(2rem,4vw,3.1rem)] font-semibold">
          {DELAVY.name}
        </h2>
        <div className="delavy-body mx-auto mt-4 max-w-[56ch] space-y-3">
          {DELAVY.description.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <div
        className="members-stage relative mx-auto mt-10 h-[min(220px,32vh)] min-h-[180px] w-[min(1100px,94%)] max-md:mt-10 max-md:grid max-md:h-auto max-md:min-h-0 max-md:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] max-md:place-items-center max-md:gap-x-4 max-md:gap-y-14 max-md:px-3 max-md:pb-8"
        aria-label="Integrantes Delavy"
      >
        {DELAVY_MEMBERS.map((member) => (
          <button
            key={member.id}
            type="button"
            className={cn(
              "member-orb delavy-orb group rounded-full border-2 bg-black p-0 transition-[border-color,box-shadow,transform] duration-150",
              "max-md:h-[110px] max-md:w-[110px]",
              active?.id === member.id
                ? "z-10 border-[var(--delavy-chrome)] shadow-[var(--delavy-glow)]"
                : "border-[var(--delavy-chrome-dim)] hover:border-[var(--delavy-chrome)] hover:shadow-[var(--delavy-glow)]",
            )}
            style={
              {
                "--x": member.x,
                "--y": member.y,
                "--size": member.size,
                "--delay": member.delay,
                "--dur": member.dur,
                "--float": `float-${member.float}`,
              } as CSSProperties
            }
            aria-label={`Ver dados de ${member.name}`}
            onClick={() => setActive(member)}
          >
            <img
              src={member.image}
              alt={member.name}
              className="size-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
            />
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.82rem] font-semibold text-[var(--delavy-muted)] group-hover:text-[var(--delavy-chrome)]">
              {member.name}
            </span>
          </button>
        ))}
      </div>

      {active ? (
        <div className="mx-auto mt-8 w-[min(1120px,92%)]">
          <article className="delavy-card relative flex flex-col items-center gap-7 rounded-xl border border-[var(--delavy-border)] border-l-[3px] border-l-[var(--delavy-chrome)] bg-black/80 px-7 py-8 sm:flex-row">
            <button
              type="button"
              className="absolute right-3 top-3 grid size-11 place-items-center text-[var(--delavy-muted)] hover:text-[var(--delavy-chrome)]"
              aria-label="Fechar"
              onClick={() => setActive(null)}
            >
              <X className="size-5" />
            </button>
            <img
              src={active.image}
              alt=""
              className="size-24 rounded-full object-cover outline outline-2 outline-[var(--delavy-chrome)]"
            />
            <div className="text-center sm:text-left">
              <h3 className="delavy-title display text-3xl leading-none">{active.name}</h3>
              <p className="mt-2 text-sm font-medium text-[var(--delavy-chrome)]">{active.role}</p>
              <p className="delavy-body mt-3 max-w-[56ch] text-sm leading-relaxed">{active.bio}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="text-xs uppercase tracking-[0.12em] text-[var(--delavy-muted)]">Canal</span>
                <span className="font-medium text-[var(--delavy-chrome)]">{active.handle}</span>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[var(--delavy-chrome)] hover:underline"
                  onClick={() => copyHandle(active.handle)}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              {whatsappHref(active.whatsapp) ? (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <a
                    href={whatsappHref(active.whatsapp)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--delavy-chrome-dim)] bg-white/5 px-4 text-sm font-medium text-[var(--delavy-chrome)] transition-colors hover:border-[var(--delavy-chrome)] hover:bg-white/10"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}

      <div className="mx-auto mt-12 w-[min(720px,90%)] text-center">
        <div className="mx-auto mb-5 h-px w-24 bg-gradient-to-r from-transparent via-[var(--delavy-chrome-dim)] to-transparent" />
        <p className="delavy-label text-[0.72rem] font-medium uppercase tracking-[0.22em]">
          Próximo passo
        </p>
        <p className="delavy-title display mt-2 text-[clamp(1.35rem,3vw,1.85rem)] font-semibold">
          Tem algo para denunciar?
        </p>
        <p className="delavy-body mx-auto mt-3 max-w-[48ch] text-sm leading-relaxed">
          Use o canal abaixo para enviar relatos de abusos digitais, panelas e
          exposição de menores. Tudo é tratado com discrição.
        </p>
      </div>
    </section>
  );
}
