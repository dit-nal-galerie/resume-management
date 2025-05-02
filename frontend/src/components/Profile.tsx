import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { getUserData, updateUserData, createUser, getAnrede } from '../services/api';
import { User } from '../../../interfaces/User';
import LoginForm from './LoginForm';
import ProfileForm from './ProfileForm';
import { loadUserFromStorage } from '../utils/storage';

const Profile: React.FC<{ loginId?: number }> = ({ loginId }) => {
  const storedUser = loadUserFromStorage(); // Загружаем данные из localStorage
  loginId = loginId || storedUser?.loginid; // Если loginId не передан, используем из localStorage
  const [formData, setFormData] = useState<User>({
    loginid: storedUser.loginid || 0,
    loginname: storedUser.loginname || '',
    password: storedUser.password || '',
    password2: storedUser.password2 || '',
    name: storedUser.name || '',
    email: storedUser.email || '',
    anrede:storedUser.anrede || 0,
    city: storedUser.city || '',
    street: storedUser.street || '',
    houseNumber: storedUser.houseNumber || '',
    postalCode: storedUser.postalCode || '',
    phone: storedUser.phone || '',
    mobile:storedUser.mobile || '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [anredeOptions, setAnredeOptions] = useState<{ id: number; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = loadUserFromStorage();
    if (!storedUser) {
      setErrors(['Вы не авторизованы']);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
    
        // Загружаем список anrede
        const anredeData = await getAnrede();
        setAnredeOptions(anredeData);
      } catch (error) {
        setErrors(['Ошибка при загрузке данных']);
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
        await createUser(formData);
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
    return <p>Загрузка...</p>;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">{loginId ? 'Редактирование профиля' : 'Создание профиля'}</h2>
          {errors.length > 0 && (
            <Alert variant="danger">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </Alert>
          )}
          <Form>
            {/* Используем компонент LoginForm */}
            <LoginForm
              loginname={formData.loginname}
              password={formData.password ?? ''}
              password2={formData.password2 ?? ''}
              onChange={handleFieldChange}
              readonlyLoginname={!!loginId}
              showPassword2={!loginId}
            />

            {/* Используем компонент ProfileForm */}
            <ProfileForm
              formData={formData}
              anredeOptions={anredeOptions}
              onChange={handleFieldChange}
            />

            <div className="d-flex justify-content-between mt-4">
              <Button variant="primary" onClick={handleSave}>
                {loginId ? 'Сохранить' : 'Создать'}
              </Button>
              <Button variant="secondary" onClick={handleBack}>
                Назад
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
