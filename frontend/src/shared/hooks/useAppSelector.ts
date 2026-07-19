import type { RootState } from "@/shared/types";
import { useSelector } from "react-redux";

export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
