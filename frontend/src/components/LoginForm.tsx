import React from 'react';
import { User } from '../../../interfaces/User';
import { useTranslation } from 'react-i18next';


interface LoginFormProps {
  loginname: string;
  password: string;
  password2?: string;
  onChange: (field: 'loginname' | 'password' | 'password2', value: string) => void;
  readonlyLoginname?: boolean;
  showPassword2?: boolean;
}

// handleFieldChange = (field: keyof User, value: string | number)
const LoginForm: React.FC<LoginFormProps> = ({
  loginname,
  password,
  password2,
  onChange,
  readonlyLoginname = false,
  showPassword2 = false,
}) => {
    const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="loginname" className="block text-sm font-medium text-gray-700">
          {t('profileEdit.loginname')}
        </label>
        <input
          type="text"
          id="loginname"
          value={loginname}
          onChange={(e) => onChange('loginname', e.target.value)}
          readOnly={readonlyLoginname}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('login.usernamePlaceholder')}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('login.password')}
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onChange('password', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('login.passwordPlaceholder')}
        />
      </div>
      {showPassword2 && (
        <div>
          <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
            {t('profileEdit.password2')}
          </label>
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => onChange('password2', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={t('passwordReset.confirmPasswordPlaceholder')}
          />
        </div>
      )}
    </div>
  );
};

export default LoginForm;
