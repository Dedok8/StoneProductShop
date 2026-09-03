import { useState } from "react";

interface QuantityStepperProps {
  quantity: number;

  onChange: (quantity: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const QuantityStepper = ({
  quantity,
  onChange,
  disabled = false,
  min = 1,
  max,
}: QuantityStepperProps) => {
  const [inputValue, setInputValue] = useState(String(quantity));
  const [prevQuantity, setPrevQuantity] = useState(quantity);

  if (quantity !== prevQuantity) {
    setPrevQuantity(quantity);
    setInputValue(String(quantity));
  }

  const clamp = (value: number) => {
    let result = value;
    if (result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  };
  const handleDecrease = () => {
    if (quantity - 1 < min) return;
    onChange(quantity - 1);
  };

  const handleIncrease = () => {
    onChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw !== "" && !/^\d+$/.test(raw)) return;

    setInputValue(raw);
  };

  const handleInputBlur = () => {
    if (inputValue === "") {
      setInputValue(String(quantity));
      return;
    }

    const parsed = clamp(Number(inputValue));
    setInputValue(String(parsed));
    onChange(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
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

      {/* <span className="w-8 select-none text-center text-sm font-medium tabular-nums text-foreground">
        {quantity}
      </span> */}

      <input
        type="text"
        inputMode="numeric"
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        disabled={disabled}
        value={inputValue}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        className="h-9 w-10 select-none border-x border-input bg-transparent text-center text-sm font-medium tabular-nums text-foreground outline-none disabled:opacity-40"
      />

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
