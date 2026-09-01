interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
  min?: number;
}

export const QuantityStepper = ({
  quantity,
  onChange,
  disabled = false,
  min = 1,
}: QuantityStepperProps) => {
  const handleDecrease = () => {
    if (quantity - 1 < min) return;
    onChange(quantity - 1);
  };

  const handleIncrease = () => {
    onChange(quantity + 1);
  };

  return (
    <div className="inline-flex items-center rounded-md border border-input bg-background">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        −
      </button>

      <span className="w-8 select-none text-center text-sm font-medium tabular-nums text-foreground">
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
};
