// Test-Helfer: baut einen gültigen Auth-Header (Bearer-JWT) für Mock-Requests.
// Die Services holen die userId via getUserIdFromToken() aus dem Token,
// deshalb brauchen alle Tests, die einen eingeloggten Nutzer simulieren,
// ein signiertes JWT mit dem gleichen Secret wie der Produktivcode.
import { Request } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dein_geheimes_jwt_secret';

/** Authorization-Header mit gültigem JWT für den angegebenen loginid. */
export function authHeaders(loginid: number): Record<string, string> {
  const token = jwt.sign({ loginid }, SECRET);

  return { authorization: `Bearer ${token}` };
}

/** Mock-Request mit gültigem JWT (eingeloggter Nutzer). */
export function authReq(loginid: number, base: Partial<Request> = {}): Partial<Request> {
  return { ...base, headers: authHeaders(loginid) };
}

/** Mock-Request ohne Auth (headers vorhanden, aber ohne Token). */
export function noAuthReq(base: Partial<Request> = {}): Partial<Request> {
  return { ...base, headers: {} };
}
