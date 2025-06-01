import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { FormField, inputClasses } from "../ui/FormField";
import { requestPasswordReset } from "services/api";

const RequestPasswordReset: React.FC = () => {
  const { t } = useTranslation();
  const [loginname, setLoginname] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ loginname?: string; email?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setServerError(null);

    let hasErrors = false;
    const newErrors: { loginname?: string; email?: string } = {};

    if (!loginname) {
      newErrors.loginname = t('passwordReset.usernameRequired');
      hasErrors = true;
    }
    if (!email) {
      newErrors.email = t('passwordReset.emailRequired');
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('passwordReset.invalidEmail');
      hasErrors = true;
    }
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const result = await requestPasswordReset(loginname, email);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setServerError(result.error || t('common.error'));
      }
    } catch (error) {
      setServerError(t('common.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = () => {
    setErrors({});
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">{t('passwordReset.requestTitle')}</h2>

        {isSuccess ? (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>{t('passwordReset.emailSent')}</p>
              <p className="mt-2">{t('passwordReset.checkInbox')}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {t('navigation.backToLogin')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {serverError}
              </div>
            )}

            {/* Username */}
            <FormField label={t('passwordReset.username')} htmlFor="loginname">
              <input
                id="loginname"
                type="text"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${errors.loginname ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                placeholder={t('passwordReset.usernamePlaceholder')}
                value={loginname}
                onChange={(e) => setLoginname(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.loginname && <p className="text-red-500 text-sm mt-1">{errors.loginname}</p>}
            </FormField>

            {/* Email */}
            <FormField label={t('passwordReset.email')} htmlFor="email">
              <input
                id="email"
                type="email"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                placeholder={t('passwordReset.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </FormField>

            {/* Submit button */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('passwordReset.sendResetLink')}
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:underline focus:outline-none"
                disabled={isLoading}
              >
                {t('navigation.backToLogin')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestPasswordReset;