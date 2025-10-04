import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import 'utils/i18n/i18n';

describe('LoginForm', () => {
  it('ruft onChange beim Tippen auf', async () => {
    const onChange = jest.fn();

    render(<LoginForm loginname="" password="" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/Loginname/i), 'dt'); // ⬅️ ohne setup()
    expect(onChange).toHaveBeenCalledWith('loginname', 'demo');

    await userEvent.type(screen.getByLabelText(/Passwort/i), 'dt'); // ⬅️ ohne setup()
    expect(onChange).toHaveBeenCalledWith('password', 'x');
  });
});
