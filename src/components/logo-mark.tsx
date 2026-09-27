import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/emblem.png"
      alt="Hadmage"
      className={cn(
        "rounded-full object-cover outline outline-1 -outline-offset-1 outline-primary/40",
        className,
      )}
    />
  );
}
