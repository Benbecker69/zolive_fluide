import { type ComponentProps, useId } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  /** Explains what is expected, before any error. */
  hint?: string;
  /** Error to show; it is announced with the field and marks it as invalid. */
  error?: string;
};

/** Text input with a visible label. Hint and error are tied to the field for assistive technologies. */
export function TextField({ label, hint, error, ...props }: TextFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="h-14 w-full rounded-full border-[1.5px] border-ink bg-surface px-6 text-ink placeholder:text-muted"
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-semibold text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
