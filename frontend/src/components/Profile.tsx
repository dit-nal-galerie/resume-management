import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, updateUserData, createOrUpdateUser, getAnrede } from '../services/api';
import { User } from '../../../interfaces/User';
import LoginForm from './LoginForm';
import ProfileForm from './ProfileForm';
import { loadUserFromStorage } from '../utils/storage';

const Profile: React.FC<{ loginId?: number }> = ({ loginId }) => {
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

  const [errors, setErrors] = useState<string[]>([]);
  const [anredeOptions, setAnredeOptions] = useState<{ id: number; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = loadUserFromStorage();
    if (!storedUser && !loginId) {
      setErrors(['Sie sind nicht angemeldet.']);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const anredeData = await getAnrede();
        setAnredeOptions(anredeData);
      } catch (error) {
        setErrors(['Fehler beim Laden der Daten.']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loginId]);

  const handleFieldChange = (field: keyof User, value: string | number): void => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    console.log('FormData:', { [field]: value });
  };

  const validateEmail = (email: string) => /^[^@]+@[^@]+\.[^@]+$/.test(email);

  const handleSave = async () => {
    const validationErrors: string[] = [];
    const isNewUser = !loginId;

    if (isNewUser && !formData.loginname.trim()) {
      validationErrors.push('Поле "Loginname" обязательно.');
    }

    if (!formData.password?.trim()) {
      validationErrors.push('Поле "Passwort" обязательно.');
    }

    if (!formData.email?.trim() || !validateEmail(formData.email)) {
      validationErrors.push('Поле "Email" должно быть валидным.');
    }

    if (isNewUser) {
      if (!formData.password2?.trim()) {
        validationErrors.push('Поле "Passwort wiederholen" обязательно.');
      } else if (formData.password !== formData.password2) {
        validationErrors.push('Пароли не совпадают.');
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (loginId) {
        await updateUserData(loginId, formData);
        navigate('/resumes');
      } else {
        await createOrUpdateUser(formData);
        navigate('/login');
      }
    } catch (error) {
      setErrors([String(error) || 'Ошибка при сохранении данных. Попробуйте позже.']);
    }
  };

  const handleBack = () => {
    navigate(loginId ? '/resumes' : '/login');
  };

  if (isLoading) {
    return <p className="text-center mt-10">Загрузка...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {loginId ? 'Редактирование профиля' : 'Создание профиля'}
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      <form className="space-y-6">
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

        <div className="flex justify-between pt-4">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-md"
            onClick={handleSave}
          >
            {loginId ? 'Сохранить' : 'Создать'}
          </button>
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded-md"
            onClick={handleBack}
          >
            Zurück
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
