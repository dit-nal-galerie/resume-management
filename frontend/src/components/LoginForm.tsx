import React from 'react';
import { Form } from 'react-bootstrap';
import { User } from '../../../interfaces/User';

interface LoginFormProps {
  loginname: string;
  password: string;
  password2?: string;
  onChange: (field: keyof User, value: string) => void;
  readonlyLoginname?: boolean;
  showPassword2?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loginname,
  password,
  password2,
  onChange,
  readonlyLoginname = false,
  showPassword2 = false,
}) => (
  <>
    <Form.Group controlId="loginname" className="mb-3">
      <Form.Label>Login Name</Form.Label>
      <Form.Control
        type="text"
        value={loginname}
        onChange={(e) => onChange('loginname', e.target.value)}
        readOnly={readonlyLoginname}
        required
      />
    </Form.Group>

    <Form.Group controlId="password" className="mb-3">
      <Form.Label>Passwort</Form.Label>
      <Form.Control
        type="password"
        value={password}
        onChange={(e) => onChange('password', e.target.value)}
        required
      />
    </Form.Group>

    {showPassword2 && (
      <Form.Group controlId="password2" className="mb-3">
        <Form.Label>Wiederholen Passwort</Form.Label>
        <Form.Control
          type="password"
          value={password2}
          onChange={(e) => onChange('password2', e.target.value)}
          required
        />
      </Form.Group>
    )}
  </>
);


export default LoginForm;
