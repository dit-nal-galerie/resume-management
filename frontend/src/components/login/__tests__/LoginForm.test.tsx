import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import 'utils/i18n/i18n';

describe('LoginForm', () => {
  it('ruft onChange beim Tippen auf', async () => {
    const onChange = jest.fn();

    render(<LoginForm loginname="" password="" onChange={onChange} />);

    // Label kommt aus i18n ("Login name" / "Loginname") -> Regex auf beide Sprachen
    await userEvent.type(screen.getByLabelText(/login\s?name/i), 'demo');
    expect(onChange).toHaveBeenCalledWith('loginname', 'd');

    await userEvent.type(screen.getByLabelText(/password|passwort/i), 'x');
    expect(onChange).toHaveBeenCalledWith('password', 'x');
  });

  it('rendert beide Felder mit value-Verbindung', () => {
    const onChange = jest.fn();

    render(<LoginForm loginname="john" password="secret" onChange={onChange} />);

    expect(screen.getByLabelText(/login\s?name/i)).toHaveValue('john');
    expect(screen.getByLabelText(/password|passwort/i)).toHaveValue('secret');
  });
});
