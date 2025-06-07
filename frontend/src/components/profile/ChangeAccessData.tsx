import React, { useEffect, useState } from 'react';
import { User } from '../../../interfaces/User';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadUserFromStorage } from 'utils/storage';
import { updateAccessData } from 'services/api';
import { FormField, inputClasses } from '../ui/FormField';
import PageHeader from 'components/ui/PageHeader';
import { PageId } from 'components/ui/PageId';

const ChangeAccessData: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    loginname: '',
    email: '',
    password: '',
    password2: '',
    oldPassword: '',
    changePassword: false,
  });
  const loginUser: User = loadUserFromStorage();
  useEffect(() => {
    setFormData({
      loginname: loginUser.loginname,
      email: loginUser.email,
      password: '',
      password2: '',
      oldPassword: '',
      changePassword: false,
    });
  }, []);
  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/resumes');
  };
  const handleSave = async () => {
    try {
      const response = await updateAccessData({ ...formData, userId: loginUser.loginid });
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        alert(t('profile.saveSuccess'));
        navigate('/resumes');
      } else {
        alert(t('profile.saveError') + ': ' + response.message);
      }
    } catch (error) {
      alert(t('profile.saveError'));
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">
      <PageHeader pageTitle={t('resumeList.changeAccess')} pageId={PageId.Login} />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
          {/* Loginname */}
          <FormField label={t('login.username')} htmlFor="loginname">
            <input
              id="loginname"
              type="text"
              value={formData.loginname}
              onChange={(e) => handleFieldChange('loginname', e.target.value)}
              className={inputClasses}
              placeholder={t('login.usernamePlaceholder')}
            />
          </FormField>

          {/* E-Mail */}
          <FormField label={t('profile.email')} htmlFor="email">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={inputClasses}
              placeholder={t('profile.email')}
            />
          </FormField>

          {/* Checkbox Passwort ändern */}
          <div className="flex items-center space-x-2">
            <input
              id="changePassword"
              type="checkbox"
              checked={formData.changePassword}
              onChange={(e) => handleFieldChange('changePassword', e.target.checked)}
            />
            <label htmlFor="changePassword" className="text-sm text-gray-700">
              {t('login.password') + ' ' + t('common.edit')}
            </label>
          </div>

          {/* Neue Passwörter nur wenn gecheckt */}
          {formData.changePassword && (
            <>
              <FormField label={t('passwordReset.newPassword')} htmlFor="password">
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={inputClasses}
                  placeholder={t('passwordReset.newPasswordPlaceholder')}
                />
              </FormField>
              <FormField label={t('passwordReset.confirmPassword')} htmlFor="password2">
                <input
                  id="password2"
                  type="password"
                  value={formData.password2}
                  onChange={(e) => handleFieldChange('password2', e.target.value)}
                  className={inputClasses}
                  placeholder={t('passwordReset.confirmPasswordPlaceholder')}
                />
              </FormField>
            </>
          )}

          {/* Altes Passwort / Passwort */}
          <FormField
            label={formData.changePassword ? t('passwordReset.newPassword') : t('login.password')}
            htmlFor="oldPassword"
          >
            <input
              id="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={(e) => handleFieldChange('oldPassword', e.target.value)}
              className={inputClasses}
              placeholder={
                formData.changePassword
                  ? t('passwordReset.newPasswordPlaceholder')
                  : t('login.passwordPlaceholder')
              }
            />
          </FormField>

          {/* Submit */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-800"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              className="rounded-md bg-gray-300 px-4 py-2 font-semibold text-black hover:bg-gray-400"
              onClick={handleBack}
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeAccessData;
