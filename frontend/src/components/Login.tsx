import React, { useState, useRef } from 'react';
import { Form, Button, InputGroup, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { login } from '../services/api'; // Подключение функции логина из api.js
import { User } from '../../../interfaces/User';

const Login: React.FC = () => {
  const [loginname, setLoginname] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState<string | null>(null); // Ошибки сервера
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState<{ loginname?: string; password?: string }>({});
  const navigate = useNavigate(); // Инициализация useNavigate
  const loginInputRef = useRef<HTMLInputElement>(null); // Референс для установки фокуса на поле loginname

  const handleRegister = () => {
    navigate('/profile'); // Перенаправление на страницу Profile
  };

  const handleRestorePassword = () => {
    navigate('/restore'); // Перенаправление на страницу восстановления пароля
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stoppt das Standard-Formularverhalten
  
    const form = event.currentTarget;
  
    // 🔹 Validierungsprüfung für die Form
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
  
    try {
      // 🔹 Login-API-Aufruf
      const userData: User = await login(loginname, password);
  
      if (userData) {
        // ✅ Erfolgreiches Login → Speichert kompletten Benutzer in `localStorage`
        setServerError(null);
        localStorage.setItem("user", JSON.stringify(userData));
  
        navigate("/resumes"); // Weiterleitung zur Bewerbungsseite
      } else {
        // ❌ Fehlerhafte Anmeldung → Zeigt Fehler
        setServerError("Ungültiger Login oder Passwort.");
        setErrors({ loginname: "Überprüfe den Login", password: "Überprüfe das Passwort" });
        loginInputRef.current?.focus();
      }
    } catch (error) {
      // ❌ Fehlerbehandlung für API-Probleme
      setServerError("Serverfehler. Bitte später erneut versuchen.");
      loginInputRef.current?.focus();
    }
  };

  const handleBlur = () => {
    setErrors({}); // Убираем сообщения об ошибках при уходе фокуса
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Войти в систему</h2>
          <Form noValidate validated={validated} onSubmit={handleLogin}>
            {/* Поле логина */}
            <Form.Group controlId="formLoginName" className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <InputGroup>
                <Form.Control
                  required
                  type="text"
                  placeholder="Введите ваш логин"
                  value={loginname}
                  onChange={(e) => setLoginname(e.target.value)}
                  onBlur={handleBlur}
                  isInvalid={!!errors.loginname}
                  ref={loginInputRef} // Связывание поля с ref
                />
                <Form.Control.Feedback type="invalid">
                  {errors.loginname || 'Пожалуйста, введите имя пользователя.'}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Поле пароля */}
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <InputGroup>
                <Form.Control
                  required
                  type="password"
                  placeholder="Введите ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handleBlur}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password || 'Пожалуйста, введите пароль.'}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Ошибки сервера */}
            {serverError && (
              <Alert variant="danger" className="mt-3">
                {serverError}
              </Alert>
            )}

            {/* Кнопки */}
            <div className="d-flex justify-content-between">
              <Button type="submit" variant="primary">
                Войти
              </Button>
              <Button variant="secondary" type="button" onClick={handleRegister}>
                Регистрация
              </Button>
            </div>

            <div className="mt-3 text-center">
              <Button variant="link" type="button" onClick={handleRestorePassword}>
                Восстановить пароль
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;