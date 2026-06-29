import {
  createSlice,
  type PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";

import type { RootState } from "@/app/store/types";
import type { IUser } from "@/shared/api/types";

interface IUserSlice {
  user: IUser | null;
  accessToken: string | null;
  loading: boolean;
  error: SerializedError | null;
}

const initialState: IUserSlice = {
  user: null,
  accessToken: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: IUser; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
