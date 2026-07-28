import { baseApi } from "@/shared";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/model/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: true }).concat(
      baseApi.middleware
    ),
});
