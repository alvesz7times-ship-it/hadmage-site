import { Check, Copy, MessageCircle, X } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { MEMBERS } from "@/data/content";
import { cn } from "@/lib/utils";

type Member = (typeof MEMBERS)[number];

function whatsappHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function Members() {
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
    <section className="panel-enter pb-16 pt-10">
      <div className="mx-auto w-[min(1120px,92%)] text-center">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
          Equipe
        </p>
        <h2 className="display mt-2 text-[clamp(2rem,4vw,3.1rem)] font-semibold text-primary-hot">
          Membros
        </h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-muted">
          Clique em um retrato para ver o papel de cada pessoa e o WhatsApp de contato.
        </p>
      </div>

      <div
        className="members-stage relative mx-auto mt-8 h-[min(700px,82vh)] min-h-[480px] w-[min(1100px,94%)] max-md:mt-8 max-md:grid max-md:h-auto max-md:min-h-0 max-md:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] max-md:place-items-center max-md:gap-x-4 max-md:gap-y-14 max-md:px-3 max-md:pb-8"
        aria-label="Membros do grupo"
      >
        {MEMBERS.map((member) => (
          <button
            key={member.id}
            type="button"
            className={cn(
              "member-orb group rounded-full border-2 bg-surface p-0 transition-[border-color,box-shadow,transform] duration-150",
              "max-md:h-[110px] max-md:w-[110px]",
              active?.id === member.id
                ? "z-10 border-primary shadow-[var(--shadow-glow)]"
                : "border-primary/70 hover:border-primary hover:shadow-[var(--shadow-glow)]",
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
              className="size-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
            />
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.82rem] font-semibold text-muted group-hover:text-fg">
              {member.name}
            </span>
          </button>
        ))}
      </div>

      {active ? (
        <div className="mx-auto mt-8 w-[min(1120px,92%)]">
          <article className="relative flex flex-col items-center gap-7 rounded-xl border border-border border-l-[3px] border-l-primary bg-bg-elevated px-7 py-8 sm:flex-row">
            <button
              type="button"
              className="absolute right-3 top-3 grid size-11 place-items-center text-muted hover:text-fg"
              aria-label="Fechar"
              onClick={() => setActive(null)}
            >
              <X className="size-5" />
            </button>
            <img
              src={active.image}
              alt=""
              className="size-24 rounded-full object-cover outline outline-2 outline-primary"
            />
            <div className="text-center sm:text-left">
              <h3 className="display text-3xl leading-none text-primary-hot">{active.name}</h3>
              <p className="mt-2 text-sm font-medium text-primary">{active.role}</p>
              <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted">{active.bio}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span className="text-xs uppercase tracking-[0.12em] text-muted">Canal</span>
                <span className="font-medium text-fg">{active.handle}</span>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-primary-hot hover:underline"
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
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-4 text-sm font-medium text-primary-hot transition-colors hover:border-primary hover:bg-primary/25"
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
    </section>
  );
}
