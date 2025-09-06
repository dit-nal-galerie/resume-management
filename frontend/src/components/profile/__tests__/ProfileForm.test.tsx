import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileForm from '../ProfileForm';

import 'utils/i18n/i18n';
import { User } from '../../../../../interfaces';


const defaultUser: User = {
  loginname: '',
  name: '',
  email: '',
  anrede: 1,
  city: '',
  street: '',
  houseNumber: '',
  postalCode: '',
};

const anredeOptions = [
  { id: 1, text: 'db.salutation.mr' },
  { id: 2, text: 'db.salutation.mrs' },
  { id: 3, text: 'db.salutation.diverse' },
];

describe('ProfileForm', () => {
  it('ruft onChange beim Tippen auf', () => {
    const onChange = jest.fn();

    render(<ProfileForm formData={defaultUser} anredeOptions={anredeOptions} onChange={onChange} />);

    const nameInput = screen.getByLabelText(/name/i);

    fireEvent.change(nameInput, { target: { value: 'Max Mustermann' } });
    expect(onChange).toHaveBeenCalledWith('name', 'Max Mustermann');

    const emailInput = screen.getByLabelText(/e-?mail/i);

    fireEvent.change(emailInput, { target: { value: 'max@example.com' } });
    expect(onChange).toHaveBeenCalledWith('email', 'max@example.com');
  });
});
