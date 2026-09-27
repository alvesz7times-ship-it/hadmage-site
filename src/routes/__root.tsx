import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-[min(560px,92%)] flex-col items-center justify-center py-16 text-center">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
        404
      </p>
      <h1 className="display mt-2 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold text-primary-hot">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-muted">
        Esse endereço não existe neste site. Volte ao início ou use o menu.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full border border-primary/50 bg-primary/15 px-5 text-sm font-medium text-primary-hot transition-colors hover:border-primary hover:bg-primary/25"
      >
        Ir para o início
      </Link>
    </main>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HADMAGE — Grupo privado de hackers éticos" },
      {
        name: "description",
        content:
          "HADMAGE: grupo privado de amigos — hackers éticos — vinculado à bolha no WhatsApp. Compartilhamos conhecimento sobre internet, segurança e tecnologia.",
      },
      { name: "theme-color", content: "#030508" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  notFoundComponent: NotFoundPage,
  component: () => (
    <html lang="pt-BR" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg font-sans">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
