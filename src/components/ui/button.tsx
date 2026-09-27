import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-fg shadow-[var(--shadow-glow)] hover:bg-primary-hot",
        outline:
          "border border-primary/55 bg-transparent text-fg hover:bg-primary/15",
        ghost: "bg-transparent text-muted hover:text-fg",
      },
      size: {
        md: "h-11 rounded-full px-5 text-sm",
        lg: "h-12 rounded-full px-6 text-[0.95rem]",
        block: "h-12 w-full rounded-md px-5 text-sm",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
