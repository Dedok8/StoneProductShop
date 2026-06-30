import { useRegisterMutation } from "@/features/auth/api";

import type { IRegisterRequest } from "@/shared/api/types";

export const useRegistration = () => {
  const [registerMutation, { isLoading, error }] = useRegisterMutation();

  async function register(credentials: IRegisterRequest) {
    return await registerMutation(credentials).unwrap();
  }

  return { register, isLoading, error };
};
