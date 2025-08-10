import React, { useEffect, useState } from 'react';
import { User } from '../../../interfaces/User';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getUserProfile, updateAccessData } from 'services/api';
import { FormField, inputClasses } from '../ui/FormField';
import PageHeader from 'components/ui/PageHeader';
import { PageId } from 'components/ui/PageId';

const ChangeAccessData: React.FC = () => {
  const { t } = useTranslation();
  const [storedUser, setStoredUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    loginname: '',
    email: '',
    password: '',
    password2: '',
    oldPassword: '',
    changePassword: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    getUserProfile()
      .then(setStoredUser)
      .catch(() => setStoredUser(null));
    if (storedUser) {
      setFormData({
        loginname: storedUser.loginname,
        email: storedUser.email,
        password: '',
        password2: '',
        oldPassword: '',
        changePassword: false,
      });
    }
  }, []);

  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: '', // Fehler beim Tippen zurücksetzen
    }));
  };

  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/resumes');
  };

  const requiredMark = <span className="text-red-600">*</span>;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.loginname) newErrors.loginname = t('login.usernameRequired');
    if (!formData.email) newErrors.email = t('profile.emailRequired') || 'E-Mail ist erforderlich';
    if (!formData.oldPassword) newErrors.oldPassword = t('login.passwordRequired');
    if (formData.changePassword) {
      if (!formData.password) newErrors.password = t('passwordReset.newPasswordRequired') || 'Neues Passwort ist erforderlich';
      if (!formData.password2) newErrors.password2 = t('passwordReset.confirmPasswordRequired') || 'Bestätigung ist erforderlich';
      if (formData.password !== formData.password2) newErrors.password2 = t('passwordReset.passwordsDontMatch') || 'Passwörter stimmen nicht überein';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const response = await updateAccessData({ ...formData, userId: 0 });
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
          <FormField label={<>{t('login.username')} {requiredMark}</>} htmlFor="loginname">
            <input
              id="loginname"
              type="text"
              value={formData.loginname}
              onChange={(e) => handleFieldChange('loginname', e.target.value)}
              className={inputClasses + (errors.loginname ? ' border-red-500' : '')}
              placeholder={t('login.usernamePlaceholder')}
              required
            />
            {errors.loginname && <div className="text-red-600 text-sm">{errors.loginname}</div>}
          </FormField>

          {/* E-Mail */}
          <FormField label={<>{t('profile.email')} {requiredMark}</>} htmlFor="email">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={inputClasses + (errors.email ? ' border-red-500' : '')}
              placeholder={t('profile.email')}
              required
            />
            {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
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
              <FormField label={<>{t('passwordReset.newPassword')} {requiredMark}</>} htmlFor="password">
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={inputClasses + (errors.password ? ' border-red-500' : '')}
                  placeholder={t('passwordReset.newPasswordPlaceholder')}
                  required
                />
                {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}
              </FormField>
              <FormField label={<>{t('passwordReset.confirmPassword')} {requiredMark}</>} htmlFor="password2">
                <input
                  id="password2"
                  type="password"
                  value={formData.password2}
                  onChange={(e) => handleFieldChange('password2', e.target.value)}
                  className={inputClasses + (errors.password2 ? ' border-red-500' : '')}
                  placeholder={t('passwordReset.confirmPasswordPlaceholder')}
                  required
                />
                {errors.password2 && <div className="text-red-600 text-sm">{errors.password2}</div>}
              </FormField>
            </>
          )}

          {/* Altes Passwort / Passwort */}
          <FormField
            label={
              <>
                {formData.changePassword
                  ? t('passwordReset.newPassword')
                  : t('login.password')}
                {' '}
                {requiredMark}
              </>
            }
            htmlFor="oldPassword"
          >
            <input
              id="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={(e) => handleFieldChange('oldPassword', e.target.value)}
              className={inputClasses + (errors.oldPassword ? ' border-red-500' : '')}
              placeholder={
                formData.changePassword
                  ? t('passwordReset.newPasswordPlaceholder')
                  : t('login.passwordPlaceholder')
              }
              required
            />
            {errors.oldPassword && <div className="text-red-600 text-sm">{errors.oldPassword}</div>}
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
}
export default ChangeAccessData;