import { useUpdateUserRoleMutation } from "@/entities";
import type { IUpdateUserRoleRequest } from "@/shared";

export const useUpdateUserRole = () => {
  const [updateUserRoleMutation, { isLoading, error, isError }] =
    useUpdateUserRoleMutation();

  async function updateUserRole(userId: string, body: IUpdateUserRoleRequest) {
    const data = await updateUserRoleMutation({ id: userId, body }).unwrap();
    return data;
  }

  return { updateUserRole, isLoading, error, isError };
};
