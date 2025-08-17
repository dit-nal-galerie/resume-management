// src/shared/api/queries.ts
// Zentrale Fetcher ohne React-Abhängigkeit. Später in Hooks via react-query genutzt.

// ENV-Konfiguration
const API_TYPE = process.env.REACT_APP_API_TYPE ?? 'php';
export const API_URL =
  API_TYPE === 'php'
    ? (process.env.REACT_APP_API_URL_PHP ?? 'http://localhost:8888')
    : (process.env.REACT_APP_API_URL_NODE ?? 'http://localhost:3001');

type Json = Record<string, any> | any[];

// Helper: JSON sicher lesen (Backend sendet teils Text)
async function parseJsonResponse(res: Response, context: string) {
  const text = await res.text();
  // Debug-Log wie im alten Code
  // eslint-disable-next-line no-console
  console.log(`Response body ${context}:`, API_URL, text);
  try {
    return JSON.parse(text);
  } catch {
    // Falls leeres oder ungültiges JSON, trotzdem Fehler werfen
    throw new Error('api.error.server');
  }
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UpdateAccessDataResponse {
  success?: boolean;
  message?: string;
}

// 1) Users
export async function login(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('api.error.login_failed');
  return parseJsonResponse(res, 'login');
}

export async function logout() {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  // eslint-disable-next-line no-console
  console.log('Response status logout:', API_URL, res.status);
  return;
}

export async function getUserProfile() {
  const res = await fetch(`${API_URL}/me`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.user_fetch_failed');
  return parseJsonResponse(res, 'getUserProfile');
}

export async function updateUserData(user: Json) {
  const res = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('api.error.user_save_failed');
  return parseJsonResponse(res, 'updateUserData');
}

export async function createOrUpdateUser(user: Json) {
  return updateUserData(user);
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_URL}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('api.error.password_reset_request_failed');
  return parseJsonResponse(res, 'requestPasswordReset');
}

export async function resetPassword(payload: { token: string; password: string }) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('api.error.password_reset_failed');
  return parseJsonResponse(res, 'resetPassword');
}

export async function validateToken(token: string) {
  const res = await fetch(`${API_URL}/validate-token?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.token_invalid');
  return parseJsonResponse(res, 'validateToken');
}

export async function updateAccessData(payload: Json): Promise<UpdateAccessDataResponse> {
  try {
    const res = await fetch(`${API_URL}/updateAccessData`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonResponse(res, 'updateAccessData');
    if (!res.ok) {
      return { success: false, message: 'api.error.access_save_failed' };
    }
    return data as UpdateAccessDataResponse;
  } catch (e: any) {
    return { success: false, message: e?.message ?? 'api.error.server' };
  }
}

export async function getUserAnredeAndName() {
  // Laut vorhandener api.ts: '/meanrede' (Schreibweise beibehalten)
  const res = await fetch(`${API_URL}/meanrede`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.user_fetch_failed');
  return parseJsonResponse(res, 'getUserAnredeAndName');
}

// 2) Dictionaries (Anrede, States)
export type StateDto = { stateid: number; text: string };
export type AnredeDto = { id: number; key?: string; text: string };

export async function getStates(): Promise<StateDto[]> {
  const res = await fetch(`${API_URL}/getStates`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.server');
  return parseJsonResponse(res, 'getStates');
}

export async function getAnrede(): Promise<AnredeDto[]> {
  const res = await fetch(`${API_URL}/getAnrede`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.server');
  return parseJsonResponse(res, 'getAnrede');
}

// 3) Resumes
export async function getResumesWithUsers() {
  const res = await fetch(`${API_URL}/getResumesWithUsers`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.resume_fetch_failed');
  return parseJsonResponse(res, 'getResumesWithUsers');
}

export async function getResumeById(params: { resumeId: number; refId: number }) {
  const { resumeId, refId } = params;
  const url = `${API_URL}/getResumeById?resumeId=${resumeId}&refId=${refId}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.resume_fetch_failed');
  return parseJsonResponse(res, 'getResumeById');
}

export async function updateOrCreateResume(payload: Json) {
  const res = await fetch(`${API_URL}/updateOrCreateResume`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('api.error.resume_save_failed');
  return parseJsonResponse(res, 'updateOrCreateResume');
}

export async function getHistoryByResumeId(params: { resumeId: number; refId: number }) {
  const { resumeId, refId } = params;
  const url = `${API_URL}/getHistoryByResumeId?resumeId=${resumeId}&refId=${refId}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.history_fetch_failed');
  return parseJsonResponse(res, 'getHistoryByResumeId');
}

export async function changeResumeStatus(payload: { resumeId: number; stateId: number; date: string }) {
  const res = await fetch(`${API_URL}/changeResumeStatus`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('api.error.status_change_failed');
  return parseJsonResponse(res, 'changeResumeStatus');
}

// 4) Contacts & Companies
export async function createOrUpdateContact(payload: Json) {
  const res = await fetch(`${API_URL}/createOrUpdateContact`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('api.error.contact_save_failed');
  return parseJsonResponse(res, 'createOrUpdateContact');
}

export async function getCompanies(isRecruter: boolean = false) {
  const res = await fetch(`${API_URL}/companies?isRecruter=${isRecruter || false}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.company_fetch_failed');
  return parseJsonResponse(res, 'getCompanies');
}

export async function getContacts(params: { refId: number; companyId: number }) {
  const { refId, companyId } = params;
  const res = await fetch(`${API_URL}/contacts?ref=${refId}&company=${companyId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('api.error.contact_fetch_failed');
  return parseJsonResponse(res, 'getContacts');
}
