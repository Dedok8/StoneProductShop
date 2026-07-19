import type { AppDispatch } from "@/shared/types";
import { useDispatch } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>;
