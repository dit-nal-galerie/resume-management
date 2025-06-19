import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { FormField, inputClasses } from '../ui/FormField';
import { requestPasswordReset } from 'services/api';

const RequestPasswordReset: React.FC = () => {
  const { t } = useTranslation();
  const [loginname, setLoginname] = useState('');
  const [email, setEmail] = useState('');
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          {t('passwordReset.requestTitle')}
        </h2>

        {isSuccess ? (
          <div className="text-center">
            <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
              <p>{t('passwordReset.emailSent')}</p>
              <p className="mt-2">{t('passwordReset.checkInbox')}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {t('navigation.backToLogin')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                {serverError}
              </div>
            )}

            {/* Username */}
            <FormField label={t('passwordReset.username')} htmlFor="loginname">
              <input
                id="loginname"
                type="text"
                className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${
                  errors.loginname
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={t('passwordReset.usernamePlaceholder')}
                value={loginname}
                onChange={(e) => setLoginname(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.loginname && <p className="mt-1 text-sm text-red-500">{errors.loginname}</p>}
            </FormField>

            {/* Email */}
            <FormField label={t('passwordReset.email')} htmlFor="email">
              <input
                id="email"
                type="email"
                className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={t('passwordReset.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </FormField>

            {/* Submit button */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="submit"
                className={`w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  isLoading ? 'cursor-not-allowed opacity-70' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('passwordReset.sendResetLink')}
              </button>
            </div>

            {/* Back to login */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
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
