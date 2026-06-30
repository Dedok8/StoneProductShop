import { logout as logoutAction, useLogoutMutation } from "@/features/auth/api";
import { FRONT_ROUTES, useAppDispatch } from "@/shared";

export const useLogout = () => {
  const [logoutMutation, { isLoading, error }] = useLogoutMutation();
  const dispath = useAppDispatch();

  async function logout() {
    try {
      await logoutMutation(undefined).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      dispath(logoutAction());
      window.location.href = FRONT_ROUTES.pages.Login.path;
    }
  }

  return { logout, isLoading, error };
};
