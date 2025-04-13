import React from 'react';
import { Form } from 'react-bootstrap';
import { User } from '../../../interfaces/User';

interface LoginFormProps {
  loginname: User['loginname']; // Использование свойства из интерфейса User
  password: User['password'];  // Использование свойства из интерфейса User
  password2?: User['password2']; // Подтверждение пароля для нового пользователя
  onChange: (field: keyof User, value: string | number) => void; // Уточнение типов
}

const LoginForm: React.FC<LoginFormProps> = ({ loginname, password, password2, onChange }) => {
  return (
    <>
      {/* Поле loginname */}
      <Form.Group controlId="formLoginName" className="mb-3">
        <Form.Label>Login Name</Form.Label>
        <Form.Control
          type="text"
          value={loginname}
          onChange={(e) => onChange('loginname', e.target.value)}
        />
      </Form.Group>

      {/* Поле password */}
      <Form.Group controlId="formPassword" className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={password || ''}
          onChange={(e) => onChange('password', e.target.value)}
        />
      </Form.Group>

      {/* Поле password2 для подтверждения пароля (только для нового пользователя) */}
      {password2 !== undefined && (
        <Form.Group controlId="formPassword2" className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={password2}
            onChange={(e) => onChange('password2', e.target.value)}
          />
        </Form.Group>
      )}
    </>
  );
};

export default LoginForm;