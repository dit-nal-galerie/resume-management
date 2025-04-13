import React from 'react';
import { Form } from 'react-bootstrap';
import { User } from '../../../interfaces/User';

interface ProfileFormProps {
  formData: Pick<
    User,
    'name' | 'email' | 'anrede' | 'city' | 'street' | 'houseNumber' | 'postalCode' | 'phone' | 'mobile'
  >; // Используем только необходимые поля из интерфейса User
  anredeOptions: { id: number; text: string }[];
  onChange: (field: keyof User, value: string | number) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ formData, anredeOptions, onChange }) => {
  const { name, email, anrede, city, street, houseNumber, postalCode, phone, mobile } = formData;

  return (
    <>
      {/* Поле anrede */}
      <Form.Group controlId="formAnrede" className="mb-3">
        <Form.Label>Anrede</Form.Label>
        <Form.Select
          value={anrede}
          onChange={(e) => onChange('anrede', Number(e.target.value))}
        >
          {anredeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Поле name */}
      <Form.Group controlId="formName" className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </Form.Group>

      {/* Поле email */}
      <Form.Group controlId="formEmail" className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </Form.Group>

      {/* Поля адреса */}
      <Form.Group controlId="formCity" className="mb-3">
        <Form.Label>City</Form.Label>
        <Form.Control
          type="text"
          value={city}
          onChange={(e) => onChange('city', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formStreet" className="mb-3">
        <Form.Label>Street</Form.Label>
        <Form.Control
          type="text"
          value={street}
          onChange={(e) => onChange('street', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formHouseNumber" className="mb-3">
        <Form.Label>House Number</Form.Label>
        <Form.Control
          type="text"
          value={houseNumber}
          onChange={(e) => onChange('houseNumber', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formPostalCode" className="mb-3">
        <Form.Label>Postal Code</Form.Label>
        <Form.Control
          type="text"
          value={postalCode}
          onChange={(e) => onChange('postalCode', e.target.value)}
        />
      </Form.Group>

      {/* Контактные данные */}
      <Form.Group controlId="formPhone" className="mb-3">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="text"
          value={phone || ''}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formMobile" className="mb-3">
        <Form.Label>Mobile</Form.Label>
        <Form.Control
          type="text"
          value={mobile || ''}
          onChange={(e) => onChange('mobile', e.target.value)}
        />
      </Form.Group>
    </>
  );
};

export default ProfileForm;