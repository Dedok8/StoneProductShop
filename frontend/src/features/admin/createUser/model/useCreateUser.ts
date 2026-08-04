import { useCreateUserMutation } from "@/entities";
import { type ICreateUserRequest } from "@/shared";

export const useCreateUser = () => {
  const [createUserMutation, { isLoading, error, isError }] =
    useCreateUserMutation();

  async function createUser(credentials: ICreateUserRequest) {
    try {
      const data = await createUserMutation(credentials).unwrap();
      return data;
    } catch (e) {
      console.error(e);
    }
  }
  return { createUser, isLoading, error, isError };
};
