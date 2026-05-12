import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/35 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex min-h-28 w-full border px-4 py-3 text-sm shadow-xs transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:bg-white focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
