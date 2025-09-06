import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { FormField } from '../ui/FormField';
import i18n from '../../utils/i18n/i18n';
import PageHeader from '../ui/PageHeader';
import { getUserAnredeAndName, login } from '../../shared/api/queries';
import { PageId } from '../ui/PageId';
import { User } from '../../../../interfaces';




const Login: React.FC = () => {
  const { t } = useTranslation();
  const [loginname, setLoginname] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ loginname?: string; password?: string }>({});
  const navigate = useNavigate();
  const loginInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUserAnredeAndName()
      .then(goToResume)
      .catch(() => setServerError(null));
  }, []);

  const goToResume = () => {
    setServerError(null);
    navigate('/resumes');
  };
  const handleRegister = () => {
    localStorage.removeItem('user');
    navigate('/profile?isNew=true');
  };

  const handleRestorePassword = () => {
    navigate('/restore');
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

      const userData: User | null = await login({ loginname, password });

      if (userData) {
        console.log('Login response:', JSON.stringify(userData));
        goToResume();
      } else {

        setServerError(t('login.invalidCredentials'));
        setErrors({
          loginname: t('login.checkUsername'),
          password: t('login.checkPassword'),
        });
        // loginInputRef.current?.focus();
      }
    } catch (error) {
      setServerError(t('common.serverError'));
      console.log('Login error:', error);
      // loginInputRef.current?.focus();
    }
  };

  const handleBlur = () => {
    setErrors({});
  };

  console.log(i18n)

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">
      <PageHeader pageTitle={t('login.title')} pageId={PageId.Login} />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <FormField label={t('login.username')} htmlFor="loginname">
              <input
                id="loginname"
                type="text"
                className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${errors.loginname
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder={t('login.usernamePlaceholder')}
                value={loginname}
                onChange={(e) => setLoginname(e.target.value)}
                onBlur={handleBlur}
                ref={loginInputRef}
              />
              {errors.loginname && <p className="mt-1 text-sm text-red-500">{errors.loginname}</p>}
            </FormField>

            {/* Password */}
            <FormField label={t('login.password')} htmlFor="password">
              <input
                id="password"
                type="password"
                className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </FormField>

            {/* Server error */}
            {serverError && <p className="mt-2 text-center text-red-500">{serverError}</p>}

            {/* Buttons */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="submit"
                className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {t('login.loginButton')}
              </button>
              <button
                type="button"
                onClick={handleRegister}
                className="rounded-md bg-gray-500 px-4 py-2 font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {t('login.registerButton')}
              </button>
            </div>

            <div className="mt-4 text-center">
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
