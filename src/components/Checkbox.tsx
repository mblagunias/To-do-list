type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative shrink-0 size-4 cursor-pointer transition-colors ${
        checked
          ? "bg-complete"
          : "border border-solid border-border bg-white hover:bg-neutral-100"
      }`}
    />
  );
}
