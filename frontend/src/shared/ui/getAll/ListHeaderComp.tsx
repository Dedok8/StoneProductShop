import { RefreshCw } from "lucide-react";

interface ListHeaderProps {
  title: string;
  onRefetch: () => void;
  refetchLabel: string;
}

function ListHeaderComp({ title, onRefetch, refetchLabel }: ListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <button
        onClick={onRefetch}
        className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <RefreshCw className="h-4 w-4" />
        {refetchLabel}
      </button>
    </div>
  );
}

export default ListHeaderComp;
