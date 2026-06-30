import s from "./input.module.scss";

import type { InputHTMLAttributes } from "react";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = ({ label, error, hint, ...rest }: IInputProps) => {
  return (
    <div className={s.inputWrapper}>
      {label && <label className={s.inputLabel}>{label}</label>}
      <input
        {...rest}
        className={`${s.inputField} ${error ? s["inputField--error"] : ""}`}
      />
      {hint && !error && <div className={s.inputHint}>{hint}</div>}
      {error && <div className={s.inputError}>{error}</div>}
    </div>
  );
};

export default Input;
