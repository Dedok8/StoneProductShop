import type { MutationState } from "@/shared/hooks/RTK/mutationTypes";

type UpdateMutationHook<Arg, Result> = () => readonly [
  (arg: Arg) => { unwrap: () => Promise<Result> },
  MutationState,
];

export function useUpdateEntity<Arg, Result>(
  useMutation: UpdateMutationHook<Arg, Result>
) {
  const [mutate, state] = useMutation();

  async function updateEntity(payload: Arg) {
    await mutate(payload).unwrap();
  }

  return { updateEntity, ...state };
}
