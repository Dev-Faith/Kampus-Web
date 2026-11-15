"use client";

import { useId, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  visibilityLabel?: string;
  wrapperClassName?: string;
};

/** Masked by default. Use wrapperClassName for spacing around the field. */
export function PasswordInput({
  id,
  className,
  wrapperClassName,
  visibilityLabel = "password",
  disabled,
  style,
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const action = `${visible ? "Hide" : "Show"} ${visibilityLabel}`;
  const Icon = visible ? EyeOff : Eye;

  return (
    <span className={cn("relative block min-w-0", wrapperClassName)}>
      <input
        autoCapitalize="none"
        spellCheck={false}
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn(
          "block min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground [&::-ms-reveal]:hidden",
          className,
        )}
        // Reserve room for the control even inside forms with their own input CSS.
        style={{ ...style, paddingRight: "3rem" }}
      />
      <button
        type="button"
        aria-label={action}
        aria-controls={inputId}
        title={action}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex min-h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon size={20} aria-hidden="true" />
      </button>
    </span>
  );
}
