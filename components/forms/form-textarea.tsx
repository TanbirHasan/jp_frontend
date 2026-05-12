"use client";

import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormTextareaProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  textareaClassName?: string;
} & Omit<ComponentProps<typeof Textarea>, "name">;

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  textareaClassName,
  ...textareaProps
}: FormTextareaProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...textareaProps}
              {...field}
              value={field.value ?? ""}
              className={cn("bg-[#fbfcfb]", textareaClassName)}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
