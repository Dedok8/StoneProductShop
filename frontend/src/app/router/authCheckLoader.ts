import { redirect } from "react-router";

import { logout, setCredentials } from "@/features/auth/api";
import { mainConfig } from "@/shared";
import { API_ROUTES, FRONT_ROUTES } from "@/shared/config/routes";

import type { AppStore } from "@/app/store/types";

interface IAuthCheckLoaderDeps {
  store: AppStore;
}

export const authCheckLoader =
  ({ store }: IAuthCheckLoaderDeps) =>
  async (): Promise<null | Response> => {
    const state = store.getState();

    if (state.auth.accessToken) return null;

    try {
      const response = await fetch(
        `${mainConfig.BASE_URL}${API_ROUTES.auth.refresh}`,
        { method: "POST", credentials: "include" }
      );

      if (!response.ok) throw new Error("Refresh failed");

      const json = await response.json();
      store.dispatch(setCredentials(json.data));
    } catch {
      store.dispatch(logout());
      return redirect(FRONT_ROUTES.pages.Login.path);
    }

    return null;
  };

export const guestLoader =
  ({ store }: IAuthCheckLoaderDeps) =>
  async (): Promise<null | Response> => {
    const state = store.getState();

    if (state.auth.accessToken) {
      return redirect(FRONT_ROUTES.pages.Home.path);
    }

    try {
      const response = await fetch(
        `${mainConfig.BASE_URL}${API_ROUTES.auth.refresh}`,
        { method: "POST", credentials: "include" }
      );

      if (response.ok) {
        const json = await response.json();
        store.dispatch(setCredentials(json.data));
        return redirect(FRONT_ROUTES.pages.Home.path);
      }
    } catch {
      //
    }

    return null;
  };
