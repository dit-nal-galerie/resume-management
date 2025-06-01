import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../../interfaces/User";
import { useTranslation } from "react-i18next";
import { login } from "services/api";
import { FormField, inputClasses } from "../ui/FormField";
import { PageId } from "components/ui/PageId";
import PageHeader from "components/ui/PageHeader";
import i18n from "utils/i18n/i18n";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [loginname, setLoginname] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ loginname?: string; password?: string }>({});
  const navigate = useNavigate();
  const loginInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = () => {
    localStorage.removeItem("user");
    navigate("/profile?loginid=0");
  };

  const handleRestorePassword = () => {
    navigate("/restore");
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginname || !password) {
      setErrors({
        loginname: !loginname ? t('login.usernameRequired') : undefined,
        password: !password ? t('login.passwordRequired') : undefined,
      });
      return;
    }

    try {
      const userData: User = await login(loginname, password);

      if (userData) {
        setServerError(null);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/resumes");
      } else {
        setServerError(t('login.invalidCredentials'));
        setErrors({
          loginname: t('login.checkUsername'),
          password: t('login.checkPassword')
        });
        loginInputRef.current?.focus();
      }
    } catch (error) {
      setServerError(t('common.serverError'));
      loginInputRef.current?.focus();
    }
  };

  const handleBlur = () => {
    setErrors({});
  };
  console.log(i18n);
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <PageHeader pageTitle={t('login.title')} pageId={PageId.Login} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <FormField label={t('login.username')} htmlFor="loginname">
              <input
                id="loginname"
                type="text"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${errors.loginname ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                placeholder={t('login.usernamePlaceholder')}
                value={loginname}
                onChange={(e) => setLoginname(e.target.value)}
                onBlur={handleBlur}
                ref={loginInputRef}
              />
              {errors.loginname && <p className="text-red-500 text-sm mt-1">{errors.loginname}</p>}
            </FormField>

            {/* Password */}
            <FormField label={t('login.password')} htmlFor="password">
              <input
                id="password"
                type="password"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </FormField>

            {/* Server error */}
            {serverError && <p className="text-red-500 text-center mt-2">{serverError}</p>}

            {/* Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {t('login.loginButton')}
              </button>
              <button
                type="button"
                onClick={handleRegister}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {t('login.registerButton')}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleRestorePassword}
                className="text-blue-500 hover:underline focus:outline-none"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;