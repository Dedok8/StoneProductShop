import { useChangeMyPasswordMutation } from "@/entities";
import { setUser, useAppDispatch } from "@/shared";
import type { IChangePasswordRequest } from "@/shared/types";

export const useChangePassword = () => {
  const dispatch = useAppDispatch();
  const [changePasswordMutation, { isLoading, error, isError }] =
    useChangeMyPasswordMutation();

  async function changePassword(credentials: IChangePasswordRequest) {
    try {
      const data = await changePasswordMutation(credentials).unwrap();
      dispatch(setUser(data));
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  return { changePassword, error, isLoading, isError };
};
