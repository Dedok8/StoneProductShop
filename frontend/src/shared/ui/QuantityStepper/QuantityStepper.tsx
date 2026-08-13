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
    <div>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>

      <span>{quantity}</span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};
