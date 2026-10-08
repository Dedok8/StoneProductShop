import { useUpdateMeMutation } from "@/entities";
import { setUser, useAppDispatch } from "@/shared";
import { type IUpdateUserRequest } from "@/shared/types";

export const useUpdateMe = () => {
  const dispatch = useAppDispatch();
  const [updateUserMutation, { isLoading, error, isError }] =
    useUpdateMeMutation();

  async function updateMe(credentials: IUpdateUserRequest) {
    const data = await updateUserMutation(credentials).unwrap();
    dispatch(setUser(data));
    return data;
  }

  return { updateMe, error, isLoading, isError };
};
