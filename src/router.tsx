import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function DefaultNotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-[min(560px,92%)] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-muted">Página não encontrada</p>
      <a href="/" className="mt-4 text-sm font-medium text-primary-hot hover:underline">
        Voltar ao início
      </a>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: DefaultNotFound,
  });
}
