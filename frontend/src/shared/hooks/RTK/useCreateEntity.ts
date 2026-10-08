import type { MutationState } from "@/shared/hooks/RTK/mutationTypes";

type CreateMutationHook<Arg, Result> = () => readonly [
  (arg: Arg) => { unwrap: () => Promise<Result> },
  MutationState,
];

export function useCreateEntity<Arg, Result>(
  useMutation: CreateMutationHook<Arg, Result>
) {
  const [mutate, state] = useMutation();

  async function createEntity(payload: Arg) {
    return await mutate(payload).unwrap();
  }

  return { createEntity, ...state };
}
