// src/shared/api/queries.ts
// Präzise Typen für alle Endpunkte, passend zu deinen Komponenten

import { Resume, HistoryEntry, Contact, User, Company } from '../../../../interfaces';

// ENV
const API_TYPE = import.meta.env.VITE_API_TYPE ?? 'php';

export const API_URL =
  API_TYPE === 'php'
    ? (import.meta.env.VITE_API_URL_PHP ?? 'http://localhost:8888')
    : (import.meta.env.VITE_API_URL_NODE ?? 'http://localhost:3001');

// Hilfsparser
async function parseJsonResponse<T>(res: Response, ctx: string): Promise<T> {
  const text = await res.text();

  console.log(`Response body ${ctx}:`, API_URL, text);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('api.error.server');
  }
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ==================== Users ====================
export async function login(payload: {
  loginname: string;
  password: string;
}): Promise<User | null> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  console.log('Login response:', res.status, text);

  // Server sendet bei Fehler {success:false,error:...} + 400/401/404
  if (!res.ok) {
    try {
      const err = JSON.parse(text) as { error?: string; message?: string };

      throw new Error(err.error || err.message || 'api.error.login_failed');
    } catch {
      throw new Error('api.error.login_failed');
    }
  }

  // Bei Erfolg setzt Server Cookie + gibt {name: "..."} zurück.
  // => Danach vollständiges Profil nachladen:
  return getUserProfile();
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  console.log('Response status logout:', API_URL, res.status);
}

export async function getUserProfile(): Promise<User> {
  const res = await fetch(`${API_URL}/me`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.user_fetch_failed');

  return parseJsonResponse<User>(res, 'getUserProfile');
}

export async function updateUserData(user: User): Promise<User> {
  const res = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
    // throw new Error('api.error.user_save_failed');
  }

  return parseJsonResponse<User>(res, 'updateUserData');
}

// export async function createOrUpdateUser(user: User): Promise<User> {
//   user.isNew = true;
//   return updateUserData(user);
// }

export async function requestPasswordReset(email: string, loginname: string): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, loginname }),
  });

  if (!res.ok) throw new Error('api.error.password_reset_request_failed');

  return parseJsonResponse<ApiResponse>(res, 'requestPasswordReset');
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('api.error.password_reset_failed');

  return parseJsonResponse<ApiResponse>(res, 'resetPassword');
}

export async function validateToken(token: string): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/validate-token?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.token_invalid');

  return parseJsonResponse<ApiResponse>(res, 'validateToken');
}

export interface UpdateAccessDataResponse {
  success?: boolean;
  message?: string;
  user?: User; // viele Stellen erwarten response.user → optional typisieren
}

export async function updateAccessData(payload: Partial<User>): Promise<UpdateAccessDataResponse> {
  try {
    const res = await fetch(`${API_URL}/changeAccessData`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonResponse<UpdateAccessDataResponse>(res, 'updateAccessData');

    if (!res.ok) {
      console.log('updateAccessData failed:', res.status, data);

      return { success: false, message: 'api.error.access_save_failed' };
    }

    return data;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'api.error.server';

    return { success: false, message };
  }
}

export type UserAnredeName = { name: string; anredeText: string };

export async function getUserAnredeAndName(): Promise<UserAnredeName> {
  // Alte Route laut Projekt: '/meanrede'
  const res = await fetch(`${API_URL}/meanrede`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.user_fetch_failed');

  return parseJsonResponse<UserAnredeName>(res, 'getUserAnredeAndName');
}

// ==================== Dictionaries ====================

export type StateDto = { stateid: number; text: string };
export type AnredeDto = { id: number; key?: string; text: string };

export async function getStates(): Promise<StateDto[]> {
  const res = await fetch(`${API_URL}/getStates`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.server');

  return parseJsonResponse<StateDto[]>(res, 'getStates');
}

export async function getAnrede(): Promise<AnredeDto[]> {
  const res = await fetch(`${API_URL}/getAnrede`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.server');

  return parseJsonResponse<AnredeDto[]>(res, 'getAnrede');
}

// ==================== Resumes ====================

export async function getResumesWithUsers(): Promise<Resume[]> {
  const res = await fetch(`${API_URL}/getResumesWithUsers`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.resume_fetch_failed');

  return parseJsonResponse<Resume[]>(res, 'getResumesWithUsers');
}

// export async function getResumeById(params: { resumeId: number; refId: number }): Promise<Resume> {
//   const { resumeId, refId } = params;
//   const url = `${API_URL}/getResumeById?resumeId=${resumeId}&refId=${refId}`;
//   const res = await fetch(url, {
//     method: 'GET',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//   });
//   if (!res.ok) throw new Error('api.error.resume_fetch_failed');
//   return parseJsonResponse<Resume>(res, 'getResumeById');
// }

export async function getResumeById(params: { resumeId: number; refId: number }): Promise<Resume> {
  const { resumeId, refId } = params;

  // Kandidaten-URLs (meist genutzte Muster)
  const tries: Array<{ method: 'GET' | 'POST'; url: string; body?: unknown }> = [
    // 1) /resume/{id}?ref=0
    { method: 'GET', url: `${API_URL}/resume/${resumeId}?ref=${refId}` },

    // 2) /resume?resumeId=..&refId=..
    { method: 'GET', url: `${API_URL}/resume?resumeId=${resumeId}&refId=${refId}` },

    // 3) /getResumeById?resumeId=..&refId=..
    { method: 'GET', url: `${API_URL}/getResumeById?resumeId=${resumeId}&refId=${refId}` },

    // 4) /getResumeById/{id}?refId=..
    { method: 'GET', url: `${API_URL}/getResumeById/${resumeId}?refId=${refId}` },

    // 5) POST /getResumeById mit JSON-Body
    { method: 'POST', url: `${API_URL}/getResumeById`, body: { resumeId, refId } },
  ];

  for (const attempt of tries) {
    try {
      const res = await fetch(attempt.url, {
        method: attempt.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: attempt.method === 'POST' ? JSON.stringify(attempt.body) : undefined,
      });

      const text = await res.text();

      // eslint-disable-next-line no-console
      console.log('getResumeById attempt:', attempt.method, attempt.url, res.status, text);

      if (!res.ok) {
        // 404/401/500 → nächstes Muster probieren
        continue;
      }

      try {
        return JSON.parse(text) as Resume;
      } catch {
        // JSON kaputt → nächstes Muster probieren
        continue;
      }
    } catch (e) {
      // Netzwerk/Fetch-Error → nächstes Muster probieren
      // eslint-disable-next-line no-console
      console.warn('getResumeById network error for', attempt.url, e);
    }
  }

  // Nichts hat funktioniert
  throw new Error('api.error.resume_fetch_failed');
}
export async function updateOrCreateResume(payload: Resume): Promise<Resume> {
  const res = await fetch(`${API_URL}/updateOrCreateResume`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('api.error.resume_save_failed');

  return parseJsonResponse<Resume>(res, 'updateOrCreateResume');
}

export async function getHistoryByResumeId(params: {
  resumeId: number;
  refId: number;
}): Promise<HistoryEntry[]> {
  const { resumeId, refId } = params;

  const tries: Array<{ method: 'GET' | 'POST'; url: string; body?: unknown }> = [
    { method: 'GET', url: `${API_URL}/resume/${resumeId}/history?ref=${refId}` },
    { method: 'GET', url: `${API_URL}/getHistoryByResumeId?resumeId=${resumeId}&refId=${refId}` },
    { method: 'POST', url: `${API_URL}/getHistoryByResumeId`, body: { resumeId, refId } },
  ];

  for (const attempt of tries) {
    try {
      const res = await fetch(attempt.url, {
        method: attempt.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: attempt.method === 'POST' ? JSON.stringify(attempt.body) : undefined,
      });

      const text = await res.text();

      console.log('getHistoryByResumeId attempt:', attempt.method, attempt.url, res.status, text);

      if (!res.ok) continue;

      try {
        return JSON.parse(text) as HistoryEntry[];
      } catch {
        continue;
      }
    } catch (e) {
      console.warn('getHistoryByResumeId network error for', attempt.url, e);
    }
  }

  throw new Error('api.error.history_fetch_failed');
}

export async function changeResumeStatus(payload: {
  resumeId: number;
  stateId: number;
  date: string;
}): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}/changeResumeStatus`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('api.error.status_change_failed');

  return parseJsonResponse<ApiResponse>(res, 'changeResumeStatus');
}

// ==================== Contacts & Companies ====================

export async function createOrUpdateContact(payload: Contact): Promise<Contact> {
  const res = await fetch(`${API_URL}/createOrUpdateContact`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('api.error.contact_save_failed');

  return parseJsonResponse<Contact>(res, 'createOrUpdateContact');
}

export async function getCompanies(isRecruter = false): Promise<Company[]> {
  const res = await fetch(`${API_URL}/companies?isRecruter=${isRecruter || false}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.company_fetch_failed');

  return parseJsonResponse<Company[]>(res, 'getCompanies');
}

export async function getContacts(params: {
  refId: number;
  companyId: number;
}): Promise<Contact[]> {
  const { refId, companyId } = params;
  const res = await fetch(`${API_URL}/contacts?ref=${refId}&company=${companyId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('api.error.contact_fetch_failed');

  return parseJsonResponse<Contact[]>(res, 'getContacts');
}
