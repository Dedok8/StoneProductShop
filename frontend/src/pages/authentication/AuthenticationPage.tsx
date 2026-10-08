import { LogIn, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { FRONT_ROUTES } from "@/shared";

function Authentication() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isLoginActive = pathname === FRONT_ROUTES.pages.Login.path;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-16">
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(41,37,33,0.12)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.06) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="mb-8 flex rounded-lg bg-stone-100 p-1">
          <Link
            to={FRONT_ROUTES.pages.Login.path}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              isLoginActive
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <LogIn className="size-3.5" strokeWidth={1.75} />
            {t("auth.login")}
          </Link>
          <Link
            to={FRONT_ROUTES.pages.Registration.path}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              !isLoginActive
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <UserPlus className="size-3.5" strokeWidth={1.75} />
            {t("auth.registration")}
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">
              {isLoginActive ? t("auth.hasAccount") : t("auth.newHere")}
            </span>
            <h2 className="text-xl font-semibold text-stone-900">
              {isLoginActive ? t("auth.login") : t("auth.register")}
            </h2>
            <p className="text-sm leading-relaxed text-stone-500">
              {isLoginActive ? t("auth.loginHint") : t("auth.registerHint")}
            </p>
          </div>

          <Link
            to={
              isLoginActive
                ? FRONT_ROUTES.pages.Login.path
                : FRONT_ROUTES.pages.Registration.path
            }
            className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            {isLoginActive ? t("auth.login") : t("auth.registration")}
          </Link>

          <p className="text-center text-xs text-stone-400">
            {isLoginActive ? (
              <>
                {t("auth.noAccount")}{" "}
                <Link
                  to={FRONT_ROUTES.pages.Registration.path}
                  className="font-medium text-stone-700 underline-offset-2 hover:underline"
                >
                  {t("auth.registration")}
                </Link>
              </>
            ) : (
              <>
                {t("auth.hasAccount")}{" "}
                <Link
                  to={FRONT_ROUTES.pages.Login.path}
                  className="font-medium text-stone-700 underline-offset-2 hover:underline"
                >
                  {t("auth.login")}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
