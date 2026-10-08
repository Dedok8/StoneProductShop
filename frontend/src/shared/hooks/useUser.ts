import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { selectAuthUser } from "@/shared/redux";

export const useUser = () => useAppSelector(selectAuthUser);
