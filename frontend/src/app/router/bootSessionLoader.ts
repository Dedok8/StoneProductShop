import { authApi } from "@/features";
import { logout, setCredentials, type AppStore } from "@/shared";

interface IBootSessionLoaderDeps {
  store: AppStore;
}

export const bootSessionLoader =
  ({ store }: IBootSessionLoaderDeps) =>
  async (): Promise<null> => {
    const { accessToken } = store.getState().auth;

    if (accessToken) return null;

    try {
      const data = await store
        .dispatch(authApi.endpoints.refresh.initiate())
        .unwrap();

      store.dispatch(setCredentials(data));
    } catch {
      store.dispatch(logout());
    }

    return null;
  };
