import { useCreateUserMutation } from "@/entities";
import { useCreateEntity } from "@/shared/hooks/RTK";
import { type ICreateUserRequest, type IUserResponse } from "@/shared/types";

export const useCreateUser = () => {
  const { createEntity, isLoading, error, isError } = useCreateEntity<
    ICreateUserRequest,
    IUserResponse
  >(useCreateUserMutation);

  return { createUser: createEntity, isLoading, error, isError };
};
