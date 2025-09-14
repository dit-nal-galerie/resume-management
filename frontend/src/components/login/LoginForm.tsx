import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormField, inputClasses } from '../ui/FormField';

// Wiederverwendbare FormField-Komponente

interface LoginFormProps {
  loginname: string;
  password: string;
  password2?: string;
  onChange: (field: 'loginname' | 'password' | 'password2', value: string) => void;
  readonlyLoginname?: boolean;
  showPassword2?: boolean;
  errors?: Record<string, string>;
}

// handleFieldChange = (field: keyof User, value: string | number)
const LoginForm: React.FC<LoginFormProps> = ({
  loginname,
  password,
  password2,
  onChange,
  readonlyLoginname = false,
  showPassword2 = false,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
      <FormField errors={errors} label={t('profileEdit.loginname')} htmlFor="loginname">
        <input
          type="text"
          id="loginname"
          value={loginname}
          onChange={(e) => onChange('loginname', e.target.value)}
          readOnly={readonlyLoginname}
          className={inputClasses}
          placeholder={t('login.usernamePlaceholder')}
        />
      </FormField>
      <FormField errors={errors} label={t('login.password')} htmlFor="password">
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onChange('password', e.target.value)}
          className={inputClasses}
          placeholder={t('login.passwordPlaceholder')}
          required
        />
      </FormField>
      {showPassword2 && (
        <FormField errors={errors} label={t('profileEdit.password2')} htmlFor="password2">
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => onChange('password2', e.target.value)}
            className={inputClasses}
            placeholder={t('passwordReset.confirmPasswordPlaceholder')}
          />
        </FormField>
      )}
    </div>
  );
};

export default LoginForm;
