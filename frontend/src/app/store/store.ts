import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/api/model/authSlice";
import { baseApi } from "@/shared";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      baseApi.middleware
    ),
});
