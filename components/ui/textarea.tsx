import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground flex min-h-28 w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-[color,box-shadow,border-color,background-color] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-slate-300 focus-visible:border-emerald-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-100",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
