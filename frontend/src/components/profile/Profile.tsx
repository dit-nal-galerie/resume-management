import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserData, updateUserData, createOrUpdateUser, getAnrede } from '../../services/api';
import { User } from "../../../interfaces/User";
import { loadUserFromStorage } from '../../utils/storage';

import ProfileForm from "./ProfileForm";
import LoginForm from "components/login/LoginForm";
import PageHeader from "components/ui/PageHeader";
import { PageId } from "components/ui/PageId";

const Profile: React.FC<{ loginId?: number }> = ({ loginId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = loadUserFromStorage();
  loginId = loginId || storedUser?.loginid || 0;
  const [formData, setFormData] = useState<User>({
    loginid: storedUser?.loginid || loginId,
    loginname: storedUser?.loginname || '',
    password: storedUser?.password || '',
    password2: storedUser?.password2 || '',
    name: storedUser?.name || '',
    email: storedUser?.email || '',
    anrede: storedUser?.anrede || 0,
    city: storedUser?.city || '',
    street: storedUser?.street || '',
    houseNumber: storedUser?.houseNumber || '',
    postalCode: storedUser?.postalCode || '',
    phone: storedUser?.phone || '',
    mobile: storedUser?.mobile || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Получение ID пользователя из URL или localStorage
  const getUserId = () => {
    const searchParams = new URLSearchParams(location.search);
    const loginIdFromUrl = searchParams.get("loginid");

    if (loginIdFromUrl) {
      return parseInt(loginIdFromUrl);
    }

    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.loginid;
    }

    return null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // const userId = getUserId();
      // try {
      //   setIsLoading(true);
      //   const profileData = await getUserData(userId);

      //   if (profileData) {
      //     setFormData(profileData[0]);
      //   }
      // } catch (error) {
      //   setServerError(t('common.serverError')+ " " + error);
      // } finally {
      //   setIsLoading(false);
      // }
      const anredeData = await getAnrede();
      setAnredeOptions(anredeData);
    };

    fetchProfile();
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = t('validation.required');
    }

    if (!formData.email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }

    if (!formData.city) {
      newErrors.city = t('validation.required');
    }

    if (!formData.postalCode) {
      newErrors.postalCode = t('validation.required');
    }

    if (!formData.street) {
      newErrors.street = t('validation.required');
    }

    if (!formData.houseNumber) {
      newErrors.houseNumber = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userId = getUserId();


    try {
      setIsLoading(true);
      if (loginId) {
        await updateUserData(loginId, formData);

      } else {
        await createOrUpdateUser(formData);

      }

      setIsLoading(true);
      const result = await updateUserData(userId, formData);
      console.log('Profile updated:', result);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (loginId) {
          navigate('/resumes');
        } else {
          navigate('/login');
        }
      }, 3000);

    } catch (error) {
      setServerError(t('common.serverError'));
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
  const pageTitle = loginId ? `${t("profile.title")} ${t("common.edit")}` : t("profileEdit.create_profile");
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <PageHeader pageTitle={pageTitle} pageId={PageId.Profile} />
      <div className="container mx-auto px-4 py-8">
        {isSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {t('profile.saveSuccess')}
          </div>
        )}

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">

          <LoginForm
            loginname={formData.loginname}
            password={formData.password ?? ''}
            password2={formData.password2 ?? ''}
            onChange={handleFieldChange}
            readonlyLoginname={!!loginId}
            showPassword2={!loginId}
          />
          <ProfileForm
            formData={formData}
            anredeOptions={anredeOptions}
            onChange={handleFieldChange}
          />



          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(loginId ? '/resumes' : '/login')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
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
