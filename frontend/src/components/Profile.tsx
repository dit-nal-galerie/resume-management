import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { getUserData, updateUserData, createUser, getAnrede } from '../services/api';
import { User } from '../../../interfaces/User';
import LoginForm from './LoginForm';
import ProfileForm from './ProfileForm';

const Profile: React.FC<{ loginId?: number }> = ({ loginId }) => {
  const [formData, setFormData] = useState<User>({
    loginid: loginId || 0,
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

  const [errors, setErrors] = useState<string[]>([]);
  const [anredeOptions, setAnredeOptions] = useState<{ id: number; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (loginId) {
          // Загружаем данные существующего пользователя
          const userData = await getUserData(loginId);
          setFormData(userData[0]);
        }

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

    if (!formData.loginname) validationErrors.push('Поле "loginname" обязательно.');
    if (!formData.email || !validateEmail(formData.email)) {
      validationErrors.push('Поле "email" должно быть валидным.');
    }

    if (!loginId) {
      // Проверка для нового пользователя
      if (!formData.password || !formData.password2) {
        validationErrors.push('Оба поля для пароля обязательны.');
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
        // Обновляем существующего пользователя
        await updateUserData(loginId, formData);
        navigate('/resumes');
      } else {
        // Создаем нового пользователя
        await createUser(formData);
        navigate('/login');
      }
    } catch (error) {
      setErrors([""+error ||'Ошибка при сохранении данных. Попробуйте позже.']);
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
          <h2 className="text-center mb-4">{loginId ||0? 'Редактирование профиля' : 'Создание профиля'}</h2>
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
              password={formData.password!}
              password2={formData.password2!}
              onChange={handleFieldChange}
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