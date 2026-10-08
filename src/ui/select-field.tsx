import { type ComponentProps, useId } from "react";

type SelectFieldProps = Omit<ComponentProps<"select">, "id" | "className" | "children"> & {
  label: string;
  options: { value: string; label: string }[];
};

/** Native select with a visible label: keyboard and assistive technology support come for free. */
export function SelectField({ label, options, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      <select
        id={id}
        className="h-11 rounded-full border-[1.5px] border-control-line bg-surface px-4 text-[0.9375rem] font-medium text-ink"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
