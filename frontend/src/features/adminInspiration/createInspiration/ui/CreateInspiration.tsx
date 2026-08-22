import { useCreateInspiration } from "@/features/adminInspiration/createInspiration/model/useCreateInspiration";
import { useCreateInspirationForm } from "@/features/adminInspiration/createInspiration/model/useCreateInspirationForm";
import { useTranslation } from "react-i18next";

function CreateInspiration() {
  const {createInspiration, isLoading, error, isError} = useCreateInspiration()
  const {register, handleSubmit, errors} = useCreateInspirationForm()
    const { t } = useTranslation();
  
  return (  );
}

export default CreateInspiration;