import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/shared";
import authReducer from "@/shared/redux/model/authSlice";

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
