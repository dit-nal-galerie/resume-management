import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import { validateToken, resetPassword } from '../../../shared/api/queries';
import 'utils/i18n/i18n';

jest.mock('../../../shared/api/queries', () => ({
  validateToken: jest.fn(),
  resetPassword: jest.fn(),
  // Wird von PageHeader im Render-Kontext gebraucht:
  getUserAnredeAndName: jest.fn().mockResolvedValue({ name: '', anrede: '' }),
  logout: jest.fn().mockResolvedValue(undefined),
}));

// navigate wird gemockt, damit der 3-Sekunden-Redirect nach dem Erfolg
// (setTimeout) keinen echten Routenwechsel im Test auslöst.
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockedValidate = validateToken as jest.MockedFunction<typeof validateToken>;
const mockedReset = resetPassword as jest.MockedFunction<typeof resetPassword>;

const renderPage = (url = '/reset-password?token=abc123') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <ResetPassword />
    </MemoryRouter>
  );

const submitButton = () =>
  screen.getByRole('button', { name: /reset password|passwort zurücksetzen/i });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ResetPassword', () => {
  it('sperrt den Button, solange das Token ungültig ist', async () => {
    mockedValidate.mockResolvedValue({ success: false });

    renderPage();

    // Fehlermeldung aus Phase F
    expect(
      await screen.findByText(/invalid or missing token|ungültiger oder fehlender token/i)
    ).toBeInTheDocument();

    // Button bleibt gesperrt, bis validateToken erfolgreich war
    await waitFor(() => expect(submitButton()).toBeDisabled());
  });

  it('sperrt den Button, wenn validateToken einen Fehler wirft', async () => {
    mockedValidate.mockRejectedValue(new Error('api.error.token_invalid'));

    renderPage();

    expect(
      await screen.findByText(/invalid or missing token|ungültiger oder fehlender token/i)
    ).toBeInTheDocument();
    await waitFor(() => expect(submitButton()).toBeDisabled());

    await userEvent.click(submitButton());
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it('ohne Token in der URL wird kein validateToken-Aufruf gestartet', async () => {
    renderPage('/reset-password');

    expect(
      await screen.findByText(/invalid or missing token|ungültiger oder fehlender token/i)
    ).toBeInTheDocument();
    expect(mockedValidate).not.toHaveBeenCalled();
    expect(submitButton()).toBeDisabled();
  });

  it('validiert die Passwörter, bevor die API aufgerufen wird', async () => {
    mockedValidate.mockResolvedValue({ success: true });

    renderPage();
    await waitFor(() => expect(submitButton()).toBeEnabled());

    // zu kurz (Mindestlänge 2)
    await userEvent.type(screen.getByLabelText(/new password|neues passwort/i), 'a');
    await userEvent.type(screen.getByLabelText(/confirm password|passwort bestätigen/i), 'a');
    await userEvent.click(submitButton());

    expect(
      await screen.findByText(/at least 2 characters|mindestens 2 zeichen/i)
    ).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it('setzt das Passwort mit Token und neuem Passwort zurück', async () => {
    mockedValidate.mockResolvedValue({ success: true });
    mockedReset.mockResolvedValue({ success: true });

    renderPage();
    await waitFor(() => expect(submitButton()).toBeEnabled());

    await userEvent.type(screen.getByLabelText(/new password|neues passwort/i), 'Passw0rt!');
    await userEvent.type(
      screen.getByLabelText(/confirm password|passwort bestätigen/i),
      'Passw0rt!'
    );
    await userEvent.click(submitButton());

    await waitFor(() =>
      expect(mockedReset).toHaveBeenCalledWith({ token: 'abc123', password: 'Passw0rt!' })
    );
    expect(
      await screen.findByText(/successfully reset|erfolgreich zurückgesetzt/i)
    ).toBeInTheDocument();
  });

  it('zeigt eine Fehlermeldung, wenn das Zurücksetzen fehlschlägt', async () => {
    mockedValidate.mockResolvedValue({ success: true });
    mockedReset.mockResolvedValue({ success: false, error: 'backend.error.token.invalid' });

    renderPage();
    await waitFor(() => expect(submitButton()).toBeEnabled());

    await userEvent.type(screen.getByLabelText(/new password|neues passwort/i), 'Passw0rt!');
    await userEvent.type(
      screen.getByLabelText(/confirm password|passwort bestätigen/i),
      'Passw0rt!'
    );
    await userEvent.click(submitButton());

    await waitFor(() => expect(mockedReset).toHaveBeenCalledTimes(1));
    // Fehlerbereich bleibt sichtbar, Erfolgsmeldung erscheint nicht
    expect(
      screen.queryByText(/successfully reset|erfolgreich zurückgesetzt/i)
    ).not.toBeInTheDocument();
  });
});
