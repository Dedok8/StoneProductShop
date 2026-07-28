import { useRegisterMutation } from "@/features/auth/api";
import { setCredentials } from "@/features/auth/model";
import { useAppDispatch, type IRegisterRequest } from "@/shared";

export const useRegistration = () => {
  const [registrationMutation, { isLoading, isError }] = useRegisterMutation();
  const dispatch = useAppDispatch();

  async function registration(credentials: IRegisterRequest) {
    
    const data = await registrationMutation(credentials).unwrap();
    dispatch(setCredentials(data));
  }

  return { registration, isLoading, isError };
};
