import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/components/button";

import type { ReactNode } from "react";

interface IFormShellProps {
  title: string;
  children: ReactNode;
  className?: string;

  /** Произвольный контент в шапке, справа от заголовка (например ActiveToggle) */
  headerRight?: ReactNode;

  /**
   * Если передан — компонент рендерит <form> с кнопкой сабмита.
   * Если не передан — рендерится просто <div> (для read-only/обёрточных случаев).
   */
  onSubmit?: React.SubmitEventHandler<HTMLFormElement>;
  isLoading?: boolean;
  submitText?: string;
  queryState?: ReactNode;

  /** Явное управление disabled кнопки. По умолчанию = isLoading. */
  disabled?: boolean;
}

function FormShell({
  title,
  children,
  className,
  headerRight,
  onSubmit,
  isLoading,
  submitText,
  queryState,
  disabled,
}: IFormShellProps) {
  const { t } = useTranslation();

  const wrapperClassName =
    className ??
    "mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm";

  const content = (
    <>
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {headerRight}
      </div>

      {children}

      {queryState}

      {onSubmit && (
        <Button
          type="submit"
          disabled={disabled ?? isLoading}
          className="ml-auto"
        >
          {isLoading ? t("common.loading") : submitText}
        </Button>
      )}
    </>
  );

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className={wrapperClassName}>
        {content}
      </form>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}

export default FormShell;
