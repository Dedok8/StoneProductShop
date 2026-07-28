import { useLoginMutation } from "@/features/auth/api";
import { setCredentials } from "@/features/auth/model";
import { useAppDispatch, type ILoginRequest } from "@/shared";

export const useLogin = () => {
  const [loginMutation, { isLoading, isError }] = useLoginMutation();
  const dispatch = useAppDispatch();
  async function login(credentials: ILoginRequest) {
    const data = await loginMutation(credentials).unwrap();

    dispatch(setCredentials(data));
  }

  return { login, isLoading, isError };
};
