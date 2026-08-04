import { useSelector } from "react-redux";

import type { RootState } from "@/shared/types";

export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
