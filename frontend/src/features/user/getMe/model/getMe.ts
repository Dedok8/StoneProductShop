import { useEffect } from "react";

import { useGetMeQuery } from "@/entities";
import { setUser, useAccessToken, useAppDispatch, useUser } from "@/shared";

export const useGetMe = () => {
  const accessToken = useAccessToken();
  const user = useUser();

  const { data, error, isLoading, isError, isSuccess } = useGetMeQuery(
    undefined,
    {
      skip: !accessToken,
    }
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data));
    }
  }, [isSuccess, data, dispatch]);

  return { user, error, isLoading, isError };
};
