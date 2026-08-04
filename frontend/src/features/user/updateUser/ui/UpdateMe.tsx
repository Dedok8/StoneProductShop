import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateMe } from "@/features/user/updateUser/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function UpdateMe() {
  const { updateMe, isLoading, isError, error } = useUpdateMe();
  const { t } = useTranslation();

  const [name, setName] = useState("");

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await updateMe({ name });
    } catch (e) {
      //
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

export default UpdateMe;
