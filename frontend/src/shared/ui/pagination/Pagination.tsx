import { useTranslation } from "react-i18next";

interface IPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: IPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div>
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("common.previous")}
      </button>

      <span className="text-sm text-stone-500">
        {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("common.next")}
      </button>
    </div>
  );
}

export default Pagination;
