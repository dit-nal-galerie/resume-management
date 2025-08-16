import { User } from '../../../interfaces/User';
import { Resume } from '../../../interfaces/Resume';
import { Contact } from '../../../interfaces/Contact';
import { Company } from '../../../interfaces/Company';
import { HistoryEntry } from '../../../interfaces/histori';

const isPHP = true; //process.env.REACT_APP_API_TYPE === 'php';
const API_URL = isPHP ? 'http://localhost:8888' : 'http://localhost:3001';
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
export interface UpdateAccessDataResponse {
  success?: boolean;
  message?: string;
  user?: User;
}
// 1. Create or update user
export const createOrUpdateUser = async (userData: User): Promise<string> => {
  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const text = await response.text();
  console.log('Response body createOrUpdateUser:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.user_update_failed');
  }
  return text;
};

// 2. Request password reset
export const requestPasswordReset = async (
  loginname: string,
  email: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/request-password-reset`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginname, email }),
    });
    const text = await response.text();
    console.log('Response body requestPasswordReset:', API_URL, text);
    if (!response.ok) {
      return { success: false, error: 'api.error.server' };
    }
    return JSON.parse(text) as ApiResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'api.error.server',
    };
  }
};

// 3. Reset password
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const text = await response.text();
    console.log('Response body resetPassword:', API_URL, text);
    if (!response.ok) {
      return { success: false, error: 'api.error.password_reset_failed' };
    }
    return JSON.parse(text) as ApiResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'api.error.password_reset_failed',
    };
  }
};

// 4. Validate token
export const validateToken = async (token: string): Promise<ApiResponse> => {
  try {
    if (!token) {
      return { success: false, error: 'api.error.token_required' };
    }
    const response = await fetch(`${API_URL}/validate-token?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const text = await response.text();
    console.log('Response body validateToken:', API_URL, text);
    if (!response.ok) {
      return { success: false, error: 'api.error.token_invalid' };
    }
    return JSON.parse(text) as ApiResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'api.error.token_invalid',
    };
  }
};

// 5. User login
export const login = async (loginname: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginname, password }),
  });
  const text = await response.text();
  console.log('Response body login:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.login_failed');
  }
  return JSON.parse(text);
};

// 6. Fetch user data
export const getUserData = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getUserData:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.user_fetch_failed');
  }
  return JSON.parse(text);
};

// 7. Update user data
export const updateUserData = async (userData: User): Promise<string> => {
  const requestBody: Partial<User> = { ...userData };
  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  const text = await response.text();
  console.log('Response body updateUserData:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.user_update_failed');
  }
  localStorage.setItem('user', JSON.stringify(userData));
  return text;
};

// 8. Fetch salutation list
export const getAnrede = async (): Promise<{ id: number; text: string }[]> => {
  const response = await fetch(`${API_URL}/getAnrede`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getAnrede:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.anrede_fetch_failed');
  }
  return JSON.parse(text);
};

// 9. Fetch resumes with users
export const getResumesWithUsers = async (): Promise<Resume[]> => {
  const response = await fetch(`${API_URL}/getResumesWithUsers`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getResumesWithUsers:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.resume_fetch_failed');
  }
  return JSON.parse(text);
};

// 10. Fetch resume by id
export const getResumeById = async (id: number): Promise<Resume> => {
  const response = await fetch(`${API_URL}/resume/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getResumeById:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.resume_fetch_failed');
  }
  return JSON.parse(text);
};

// 11. Update or create resume
export const updateOrCreateResume = async (resume: Resume): Promise<void> => {
  const response = await fetch(`${API_URL}/updateOrCreateResume`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resume),
  });
  const text = await response.text();
  console.log('Response body updateOrCreateResume:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.resume_save_failed');
  }
};

// 12. Fetch states
export const getStates = async (): Promise<{ stateid: number; text: string }[]> => {
  const response = await fetch(`${API_URL}/getStates`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getStates:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.server');
  }
  return JSON.parse(text);
};

// 13. Create or update contact
export const createOrUpdateContact = async (contact: Contact): Promise<void> => {
  const contactData = { ...contact, contactid: contact.contactid ?? 0 };
  const response = await fetch(`${API_URL}/createOrUpdateContact`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });
  const text = await response.text();
  console.log('Response body createOrUpdateContact:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.contact_save_failed');
  }
};

// 14. Fetch companies
export const getCompanies = async (loginId: number, isRecruter: boolean): Promise<Company[]> => {
  const res = await fetch(`${API_URL}/companies?isRecruter=${isRecruter || false}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await res.text();
  console.log('Response body getCompanies:', API_URL, text);

  if (!res.ok) {
    throw new Error('api.error.company_fetch_failed');
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // zeigt dir genau, ob HTML (Slim Error Page) oder Notice eingeflossen ist
    console.error('JSON parse failed. Raw:', text);
    throw e;
  }
};

// 15. Fetch contacts
export const getContacts = async (loginId: number, companyId: number): Promise<Contact[]> => {
  const response = await fetch(`${API_URL}/contacts?ref=${loginId}&company=${companyId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getContacts:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.contact_fetch_failed');
  }
  return JSON.parse(text);
};

// 16. Fetch history by resume id
export const getHistoryByResumeId = async (
  resumeId: number,
  refId: number
): Promise<HistoryEntry[]> => {
  const url = `${API_URL}/getHistoryByResumeId?resumeId=${resumeId}&refId=${refId}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getHistoryByResumeId:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.history_fetch_failed');
  }
  return JSON.parse(text);
};

// 17. Change resume status
export const changeResumeStatus = async (
  resumeId: number,
  stateId: number,
  date: string
): Promise<void> => {
  const url = `${API_URL}/changeResumeStatus`;
  if (!resumeId || !stateId || !date) {
    throw new Error('api.error.validation.missingData');
  } else {
    console.log('changeResumeStatus called with:', { resumeId, stateId, date });
  }
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId, stateId, date }),
  });
  const text = await response.text();
  console.log('Response body changeResumeStatus:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.status_change_failed');
  }
};

// 18. Update access data
export const updateAccessData = async (data: {
  userId: number;
  loginname: string;
  email: string;
  oldPassword: string;
  newPassword?: string;
  password2?: string;
  changePassword: boolean;
}): Promise<UpdateAccessDataResponse> => {
  const url = `${API_URL}/changeAccessData`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    console.log('Response body updateAccessData:', API_URL, text);
    const result = JSON.parse(text) as UpdateAccessDataResponse;
    if (!res.ok) {
      return { success: false, message: 'api.error.access_save_failed' };
    }
    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'api.error.server',
    };
  }
};

// 19. Get user anrede & name
export const getUserAnredeAndName = async (): Promise<{
  name: string;
  anredeText: string;
}> => {
  const response = await fetch(`${API_URL}/meanrede`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getUserAnredeAndName:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.user_fetch_failed');
  }
  return JSON.parse(text);
};

// 20. Get user profile
export const getUserProfile = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  console.log('Response body getUserProfile:', API_URL, text);
  if (!response.ok) {
    throw new Error('api.error.user_fetch_failed');
  }
  return JSON.parse(text);
};

// 21. Logout
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  console.log('Response status logout:', API_URL, response.status);
};
