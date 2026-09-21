import type { LucideIcon } from "lucide-react";

interface EmptyCompProps {
  icon: LucideIcon;
  message: string;
}

function EmptyComp({ icon: Icon, message }: EmptyCompProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
      <Icon className="h-8 w-8" />
      <p>{message}</p>
    </div>
  );
}

export default EmptyComp;
