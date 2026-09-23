interface IActiveToggleProps {
  checked?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

function ActiveToggle({ checked, onChange, label }: IActiveToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input accent-primary"
      />
      {label}
    </label>
  );
}

export default ActiveToggle;
