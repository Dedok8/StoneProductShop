import { setCredentials, useLoginMutation } from "@/features/auth/api";
import { useAppDispatch } from "@/shared";

import type { ILoginForm } from "@/features/auth/login/model/types";

export const useLogin = () => {
  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();

  async function login(credentials: ILoginForm) {
    const data = await loginMutation(credentials).unwrap();
    dispatch(
      setCredentials({ user: data.user, accessToken: data.accessToken })
    );
    return data;
  }
  return { login, isLoading, error };
};

export default useLogin;
