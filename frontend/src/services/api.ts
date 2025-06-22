const API_URL = 'http://localhost:3001';
import { User } from '../../../interfaces/User';
import { Resume } from '../../../interfaces/Resume';

// Create or update user
export const createOrUpdateUser = async (userData: User): Promise<string> => {
  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('api.error.user_update_failed');
  }

  return await response.text();
};

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Request password reset
export const requestPasswordReset = async (
  loginname: string,
  email: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/request-password-reset`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginname, email }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'api.error.server',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      // error: 'api.error.server',
      error: error instanceof Error ? error.message : 'api.error.server',
    };
  }
};

// Reset password
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'api.error.password_reset_failed',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'api.error.password_reset_failed',
    };
  }
};

// Validate token
export const validateToken = async (token: string): Promise<ApiResponse> => {
  try {
    if (!token) {
      return {
        success: false,
        error: 'api.error.token_required',
      };
    }

    const response = await fetch(`${API_URL}/validate-token?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'api.error.token_invalid',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'api.error.token_invalid',
    };
  }
};

// User login
export const login = async (loginname: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginname, password }),
  });

  if (!response.ok) {
    throw new Error('api.error.login_failed');
  }

  return await response.json();
};

// Fetch user data
export const getUserData = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    // body: JSON.stringify({ loginid }),
  });

  if (!response.ok) {
    throw new Error('api.error.user_fetch_failed');
  }

  return await response.json();
};

// Update user data
export const updateUserData = async (userData: User): Promise<string> => {
  const requestBody: Partial<User> = {
    name: userData.name,
    email: userData.email,
    city: userData.city,
    street: userData.street,
    houseNumber: userData.houseNumber,
    postalCode: userData.postalCode,
    phone: userData.phone,
    mobile: userData.mobile,
    anrede: userData.anrede,
  };

  if (userData.password) {
    requestBody.password = userData.password;
  }

  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('api.error.user_update_failed');
  }

  localStorage.setItem('user', JSON.stringify(userData));
  return await response.text();
};

// Fetch salutation list
export const getAnrede = async (): Promise<{ id: number; text: string }[]> => {
  const response = await fetch(`${API_URL}/getAnrede`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('api.error.anrede_fetch_failed');
  }

  return await response.json();
};

import { Contact } from '../../../interfaces/Contact';
import { Company } from '../../../interfaces/Company';
import { HistoryEntry } from '../../../interfaces/histori';

// Fetch resumes with users
export const getResumesWithUsers = async (): Promise<Resume[]> => {
  const response = await fetch(`${API_URL}/getResumesWithUsers`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('api.error.resume_fetch_failed');
  }

  return await response.json();
};

// Fetch resume by id
export const getResumeById = async (id: number): Promise<Resume> => {
  const response = await fetch(`${API_URL}/getResumeById/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('api.error.resume_fetch_failed');
  }

  return await response.json();
};

// Update or create resume
export const updateOrCreateResume = async (resume: Resume): Promise<void> => {
  const response = await fetch(`${API_URL}/updateOrCreateResume`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    throw new Error('api.error.resume_save_failed');
  }
};

// Fetch states
export const getStates = async (): Promise<{ stateid: number; text: string }[]> => {
  const response = await fetch(`${API_URL}/getStates`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('api.error.server');
  }

  return await response.json();
};

// Create or update contact
export const createOrUpdateContact = async (contact: Contact): Promise<void> => {
  const contactData = { ...contact, contactid: contact.contactid ?? 0 };

  const response = await fetch(`${API_URL}/createOrUpdateContact`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error('api.error.contact_save_failed');
  }
};

// Fetch companies
export const getCompanies = async (loginId: number, isRecruter: boolean): Promise<Company[]> => {
  const response = await fetch(
    `${API_URL}/companies?loginId=${loginId}&isRecruter=${isRecruter || false}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error('api.error.company_fetch_failed');
  }

  return await response.json();
};

// Fetch contacts
export const getContacts = async (loginId: number, companyId: number): Promise<Contact[]> => {
  const response = await fetch(`${API_URL}/contacts?ref=${loginId}&company=${companyId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('api.error.contact_fetch_failed');
  }

  return await response.json();
};

// Fetch history by resume id
export const getHistoryByResumeId = async (
  resumeId: number,
  refId: number
): Promise<HistoryEntry[]> => {
  const url = `${API_URL}/getHistoryByResumeId?resumeId=${resumeId}&refId=${refId}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('api.error.history_fetch_failed');
  }
  return response.json();
};

// Change resume status
export const changeResumeStatus = async (
  resumeId: number,
  userId: number,
  stateId: number,
  date: string
): Promise<void> => {
  const url = `${API_URL}/changeResumeStatus`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId, userId, stateId, date }),
  });

  if (!response.ok) {
    throw new Error('api.error.status_change_failed');
  }
};

interface UpdateAccessDataResponse {
  success?: boolean;
  message?: string;
  user?: User;
}

// Update access data
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

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: 'api.error.access_save_failed',
      };
    }

    return {
      success: true,
      message: result.message,
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'api.error.server',
    };
  }
};

// import { getUserProfile } from '../services/api'; // Schreibe diese Funktion im API-Service

// src/services/api.ts

export const getUserAnredeAndName = async (): Promise<{ name: string; anredeText: string }> => {
  const response = await fetch(`${API_URL}/me/anrede`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('api.error.user_fetch_failed');
  }

  return await response.json();
};

export const getUserProfile = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('api.error.user_fetch_failed');
  }

  return await response.json();
};
export const logout = async () => {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};
