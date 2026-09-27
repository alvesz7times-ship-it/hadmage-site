export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border py-6">
      <div className="mx-auto flex w-[min(1120px,92%)] flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>© {new Date().getFullYear()} HADMAGE</span>
        <span className="font-medium text-primary">
          Grupo privado · hackers éticos
        </span>
      </div>
    </footer>
  );
}
