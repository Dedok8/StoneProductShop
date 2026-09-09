import { useState } from "react";

import { useUpdateMe } from "@/features/user/updateUser/model";
import { useQueryState } from "@/shared";
import { Input } from "@/shared/ui/components/input";

function UpdateMe() {
  const { updateMe, isLoading, isError, error } = useUpdateMe();

  const [name, setName] = useState("");

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await updateMe({ name });
    } catch (e) {
      //
    }
  };

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      {queryState}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

export default UpdateMe;
