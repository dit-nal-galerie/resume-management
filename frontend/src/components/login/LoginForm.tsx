import React from 'react';
import { User } from '../../../interfaces/User';
import { useTranslation } from 'react-i18next';
import { FormField } from 'components/ui/FormField';


// Wiederverwendbare FormField-Komponente


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
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">

      <FormField label={t('profileEdit.loginname')} htmlFor="loginname">
        <input
          type="text"
          id="loginname"
          value={loginname}
          onChange={(e) => onChange('loginname', e.target.value)}
          readOnly={readonlyLoginname}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('login.usernamePlaceholder')}
        />
      </FormField>
      <FormField label={t('login.password')} htmlFor="password">
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onChange('password', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('login.passwordPlaceholder')}
        />
      </FormField>
      {showPassword2 && (
        <FormField label={t('profileEdit.password2')} htmlFor="password2">
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => onChange('password2', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={t('passwordReset.confirmPasswordPlaceholder')}
          />
        </FormField>
      )}
    </div>
  );
};

export default LoginForm;
