import { useTranslation } from "react-i18next";

import { LoginForm, RegistrationForm } from "@/features";

function Authentication() {
  const { t } = useTranslation();

  return (
    <div>
      <div>
        <h2>
          {t("auth.hasAccount")} {t("auth.login")}
        </h2>
        <LoginForm />
      </div>
      <div>
        <h2>{t("auth.register")}</h2>
        <RegistrationForm />
      </div>
    </div>
  );
}

export default Authentication;
