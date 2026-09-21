interface IFormShellProps {
  title: string;
  isActive?: boolean;
  onActiveChange?: (v: boolean) => void;
  activeLabel?: string;
  children: React.ReactNode;
  className?: string;
}

function FormShell({
  title,
  isActive,
  onActiveChange,
  activeLabel,
  children,
  className,
}: IFormShellProps) {
  return (
    <div
      className={
        className ??
        "mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm"
      }
    >
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {onActiveChange && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => onActiveChange(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            {activeLabel}
          </label>
        )}
      </div>
      {children}
    </div>
  );
}

export default FormShell;
