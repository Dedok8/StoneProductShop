import {
  createSlice,
  type PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";

import type { IUserResponse } from "@/shared/types";

export interface IUserSlice {
  user: IUserResponse | null;
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
  name: "Auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: IUserResponse; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
      state.error = null;
    },
    setUser(state, action: PayloadAction<IUserResponse | null>) {
      state.user = action.payload;
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

export const { setCredentials, setUser, logout } = authSlice.actions;

export const selectAuthUser = (state: { auth: IUserSlice }) => state.auth.user;
export const selectAuthAccessToken = (state: { auth: IUserSlice }) =>
  state.auth.accessToken;
export const selectAuthLoading = (state: { auth: IUserSlice }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: IUserSlice }) =>
  state.auth.error;

export default authSlice.reducer;
