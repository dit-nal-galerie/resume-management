import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormField } from '../ui/FormField';
import PageHeader from '../ui/PageHeader';
import { PageId } from '../ui/PageId';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');

    if (!tokenFromUrl) {
      setServerError(t('passwordReset.invalidToken'));
    } else {
      setToken(tokenFromUrl);
    }
  }, [location, t]);

  const resetPassword = async () => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setServerError(null);

    let hasErrors = false;
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword || newPassword.length < 2) {
      newErrors.newPassword = t('passwordReset.passwordMinLength');
      hasErrors = true;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t('passwordReset.confirmPasswordRequired');
      hasErrors = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('passwordReset.passwordsDoNotMatch');
      hasErrors = true;
    }
    if (hasErrors) {
      setErrors(newErrors);

      return;
    }
    if (!token) {
      setServerError(t('passwordReset.invalidToken'));

      return;
    }
    try {
      setIsLoading(true);
      const result = await resetPassword();

      if (result) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setServerError(t('common.error'));
      }
    } catch (error) {
      setServerError(t('common.serverError'));
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = () => {
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">
      <PageHeader pageTitle={t('resumeList.changeAccess')} pageId={PageId.Login} />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            {t('passwordReset.resetTitle')}
          </h2>

          {isSuccess ? (
            <div className="text-center">
              <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                <p>{t('passwordReset.resetSuccess')}</p>
                <p className="mt-2">{t('passwordReset.redirecting')}</p>
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

              {/* New password */}
              <FormField label={t('passwordReset.newPassword')} htmlFor="newPassword">
                <input
                  id="newPassword"
                  type="password"
                  className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${
                    errors.newPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('passwordReset.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                )}
              </FormField>

              {/* Confirm password */}
              <FormField label={t('passwordReset.confirmPassword')} htmlFor="confirmPassword">
                <input
                  id="confirmPassword"
                  type="password"
                  className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('passwordReset.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </FormField>

              {/* Submit button */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="submit"
                  className={`w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    isLoading ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  disabled={isLoading || !token}
                >
                  {isLoading ? t('common.loading') : t('passwordReset.resetPassword')}
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
    </div>
  );
};

export default ResetPassword;
