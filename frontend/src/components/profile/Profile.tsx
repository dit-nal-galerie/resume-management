import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ProfileForm from './ProfileForm';
import { getAnrede, getUserProfile, updateUserData } from '../../shared/api/queries';
import LoginForm from '../login/LoginForm';
import PageHeader from '../ui/PageHeader';
import { PageId } from '../ui/PageId';
import { User } from '../../../../interfaces';

const Profile = () => {
  const checkIsNew = () => {
    const searchParams = new URLSearchParams(location.search);
    const isNew = searchParams.get('isNew');

    return isNew === 'true';
  };
  const { t } = useTranslation();
  // const [storedUser, setStoredUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = checkIsNew();
  const [formData, setFormData] = useState<User>({
    loginname: '',
    password: '',
    password2: '',
    name: '',
    email: '',
    anrede: 0,
    city: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    phone: '',
    mobile: '',
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const anredeData = await getAnrede();

      setAnredeOptions(anredeData);
      if (!isNew) {
        const data = await getUserProfile();

        setFormData(data);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = t('validation.required');
    }
    if (!formData.loginname) {
      newErrors.loginname = t('validation.required');
    }

    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }

    if (isNew) {
      if (formData.password !== formData.password2) {
        newErrors.password2 = t('profileEdit.passwordsNoMatch');
      }
      if (!formData.password2) {
        newErrors.password2 = t('validation.required');
      }
    } else {
      // if (!formData.name) {
      //   newErrors.name = t('validation.required');
      // }
      // if (!formData.anrede) {
      //   newErrors.anrede = t('validation.required');
      // }
      // if (!formData.city) {
      //   newErrors.city = t('validation.required');
      // }
      // if (!formData.postalCode) {
      //   newErrors.postalCode = t('validation.required');
      // }
      // if (!formData.street) {
      //   newErrors.street = t('validation.required');
      // }
      // if (!formData.houseNumber) {
      //   newErrors.houseNumber = t('validation.required');
      // }
    }

    setFormErrors(newErrors); // Fehler speichern!

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // const userId = getUserId();

    try {
      setIsLoading(true);
      // console.log('formData', JSON.stringify(formData));
      formData.isNew = isNew;
      await updateUserData(formData);

      setTimeout(() => {
        setIsSuccess(false);
        if (!isNew) {
          navigate('/resumes');
        } else {
          navigate('/login');
        }
      }, 3000);
    } catch (error) {
      setServerError(t('common.serverError'));
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const [anredeOptions, setAnredeOptions] = useState<{ id: number; text: string }[]>([]);
  const handleFieldChange = (field: keyof User, value: string | number): void => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    console.log('FormData:', { [field]: value });
  };
  const pageTitle = !isNew
    ? `${t('profile.title')} ${t('common.edit')}`
    : t('profileEdit.create_profile');

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">
      <PageHeader pageTitle={pageTitle} pageId={PageId.Profile} />
      <div className="container mx-auto px-4 py-8">
        {isSuccess && (
          <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            {t('profile.saveSuccess')}
          </div>
        )}

        {serverError && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
          <LoginForm
            loginname={formData.loginname}
            password={formData.password ?? ''}
            password2={formData.password2 ?? ''}
            onChange={handleFieldChange}
            readonlyLoginname={!isNew}
            showPassword2={isNew}
            errors={formErrors}
          />
          <ProfileForm
            formData={formData}
            anredeOptions={anredeOptions}
            onChange={handleFieldChange}
            errors={formErrors}
          />

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => navigate(!isNew ? '/resumes' : '/login')}
              className="rounded-md bg-gray-500 px-4 py-2 font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              className={`rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
