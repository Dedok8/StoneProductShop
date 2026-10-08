import { useRegisterMutation } from "@/features/auth/api";
import { setCredentials, useAppDispatch } from "@/shared";
import type { IRegisterRequest } from "@/shared/types";

export const useRegistration = () => {
  const [registrationMutation, { isLoading, isError }] = useRegisterMutation();
  const dispatch = useAppDispatch();

  async function registration(credentials: IRegisterRequest) {
    const data = await registrationMutation(credentials).unwrap();
    dispatch(setCredentials(data));
  }

  return { registration, isLoading, isError };
};
