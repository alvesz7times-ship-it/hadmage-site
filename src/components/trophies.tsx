export function Trophies() {
  return (
    <section className="panel-enter flex min-h-[min(60vh,520px)] flex-col items-center justify-center px-6 pb-20 pt-16 text-center">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
        Marcos
      </p>
      <h2 className="display mt-2 text-[clamp(2rem,4vw,3.1rem)] font-semibold text-primary-hot">
        Troféus
      </h2>
      <p className="display mt-10 text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold tracking-[0.06em] text-fg/90">
        Em breve...
      </p>
      <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted">
        Estamos preparando as conquistas e os marcos do grupo.
      </p>
    </section>
  );
}
