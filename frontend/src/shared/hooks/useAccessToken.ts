import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { selectAuthAccessToken } from "@/shared/redux";

export const useAccessToken = () => useAppSelector(selectAuthAccessToken);
