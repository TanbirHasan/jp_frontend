import { AlertCircle } from "lucide-react";

type FormErrorProps = {
  message?: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex gap-3 border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
