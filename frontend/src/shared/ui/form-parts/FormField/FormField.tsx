import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";

import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

type FieldType = "text" | "number" | "password" | "textarea" | "select";

interface IFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: FieldType;
  step?: string;
  rows?: number;
  options?: { value: string; label: string }[];
}

interface IFormFieldsProps<T extends FieldValues> {
  fields: IFieldConfig<T>[];
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  className?: string;
}

function FormFields<T extends FieldValues>({
  fields,
  register,
  errors,
  className,
}: IFormFieldsProps<T>) {
  return (
    <FieldGroup className={className}>
      {fields.map(({ name, label, type = "text", step, rows, options }) => {
        const error = errors[name];

        return (
          <Field key={name} data-invalid={!!error}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>

            {type === "textarea" ? (
              <textarea
                id={name}
                rows={rows ?? 4}
                aria-invalid={!!error}
                {...register(name)}
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            ) : type === "select" ? (
              <select
                id={name}
                aria-invalid={!!error}
                {...register(name)}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={name}
                type={type}
                step={step}
                aria-invalid={!!error}
                {...register(name)}
              />
            )}

            {error && <FieldError>{error.message as string}</FieldError>}
          </Field>
        );
      })}
    </FieldGroup>
  );
}

export default FormFields;
