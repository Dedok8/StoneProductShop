import { Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/components/button";

interface ISubmitButtonProps {
  disabled: boolean;
  isLoading: boolean;
  label: string;
}

function SubmitButton({ disabled, isLoading, label }: ISubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled}>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}

export default SubmitButton;
