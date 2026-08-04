import { useFindUserByEmailQuery, useFindUserByIdQuery } from "@/entities";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useSearchUser = (query?: string) => {
  const isEmail = !!query && EMAIL_REGEX.test(query);

  const byEmail = useFindUserByEmailQuery(query ?? "", {
    skip: !query || !isEmail,
  });

  const byId = useFindUserByIdQuery(query ?? "", {
    skip: !query || isEmail,
  });

  const result = isEmail ? byEmail : byId;

  return {
    user: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
  };
};
