import { useTranslation } from "react-i18next";

import type { MutationState } from "@/shared/hooks/RTK/mutationTypes";

type DeleteMutationHook<Arg> = () => readonly [
  (arg: Arg) => { unwrap: () => Promise<unknown> },
  MutationState,
];

export function useDeleteEntity<Arg>(
  useMutation: DeleteMutationHook<Arg>,
  confirmMessageKey: string
) {
  const { t } = useTranslation();
  const [mutate, state] = useMutation();

  async function deleteEntity(arg: Arg) {
    const confirmed = window.confirm(t(confirmMessageKey));
    if (!confirmed) return;

    await mutate(arg).unwrap();
  }

  return { deleteEntity, ...state };
}
