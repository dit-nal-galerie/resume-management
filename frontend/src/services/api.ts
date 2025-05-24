const API_URL = 'http://localhost:3001';
import { User } from '../../../interfaces/User';
import { Resume } from "../../../interfaces/Resume";
// Функция для создания нового пользователя
export const createOrUpdateUser = async (userData: User): Promise<string> => {
  const response = await fetch(`${API_URL}/createOrUpdateUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
  throw new Error(`Serverfehler: ${errorText}`);

  }

  return await response.text();
};

// API сервис для работы с запросами восстановления пароля

// Интерфейс для ответа API
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Функция для запроса восстановления пароля
 * @param loginname Имя пользователя
 * @param email Email пользователя
 * @returns Promise с результатом операции
 */
export const requestPasswordReset = async (loginname: string, email: string): Promise<ApiResponse> => {
  try {
    // В реальном приложении здесь будет запрос к API
    // const response = await fetch('/api/request-password-reset', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ loginname, email }),
    // });
    // const data = await response.json();
    // return data;

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Имитация успешного ответа
    return {
      success: true,
      message: "E-Mail mit Anweisungen wurde gesendet"
    };
    
    // Для тестирования ошибки можно использовать:
    // return {
    //   success: false,
    //   error: "Benutzer mit dieser E-Mail-Adresse wurde nicht gefunden"
    // };
  } catch (error) {
    console.error("API error:", error);
    return {
      success: false,
      error: "Serverfehler. Bitte versuchen Sie es später erneut."
    };
  }
};

/**
 * Функция для отправки запроса на сброс пароля
 * @param token Токен для сброса пароля
 * @param newPassword Новый пароль пользователя
 * @returns Promise с результатом операции
 */
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  try {
    // В реальном приложении здесь будет запрос к API
    // const response = await fetch('/api/reset-password', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ token, newPassword }),
    // });
    // const data = await response.json();
    // return data;

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Имитация успешного ответа
    return {
      success: true,
      message: "Passwort wurde erfolgreich zurückgesetzt"
    };
    
    // Для тестирования ошибки можно использовать:
    // return {
    //   success: false,
    //   error: "Ungültiger Token oder abgelaufener Link"
    // };
  } catch (error) {
    console.error("API error:", error);
    return {
      success: false,
      error: "Serverfehler. Bitte versuchen Sie es später erneut."
    };
  }
};

/**
 * Функция для проверки валидности токена
 * @param token Токен для проверки
 * @returns Promise с результатом проверки
 */
export const validateToken = async (token: string): Promise<ApiResponse> => {
  try {
    // В реальном приложении здесь будет запрос к API
    // const response = await fetch(`/api/validate-token?token=${token}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   }
    // });
    // const data = await response.json();
    // return data;

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Проверка на пустой токен
    if (!token) {
      return {
        success: false,
        error: "Token ist erforderlich"
      };
    }
    
    // Имитация успешной проверки токена
    return {
      success: true,
      message: "Token ist gültig"
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      success: false,
      error: "Fehler bei der Tokenüberprüfung"
    };
  }
};



// Функция для логина пользователя
export const login = async (loginname: string, password: string) => {
  console.log("🔹 API-Aufruf mit loginname:", loginname, "und Passwort:"  ,password);

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginname, password }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при авторизации');
  }

  return await response.json();
};

// Функция для получения данных пользователя
export const getUserData = async (loginid: number): Promise<User[]> => {
  const response = await fetch(`${API_URL}/getUserData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginid }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении данных пользователя');
  }

  return await response.json();
};

// Функция для обновления данных пользователя
export const updateUserData = async (loginId:number, userData: User): Promise<string> => {
  

  if (!loginId) {
    throw new Error("Fehler: Kein loginId gefunden. Bitte erneut einloggen.");
  }

  console.log("🔹 API-Aufruf mit loginId:", loginId, "und Daten:", JSON.stringify(userData));

  const requestBody: any = {
    loginid: loginId,
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fehler bei der Benutzeraktualisierung: ${errorText}`);
  }

  // ✅ Nutzerprofil in `localStorage` speichern, wenn Update erfolgreich war
  localStorage.setItem("user", JSON.stringify(userData));

  return await response.text();
};
// Функция для получения списка обращений (Anrede)
export const getAnrede = async (): Promise<{ id: number; text: string }[]> => {
  const response = await fetch(`${API_URL}/getAnrede`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка при получении данных anrede');
  }

  return await response.json();
};

export const getResumesWithUsers = async (userid: number): Promise<any[]> => {
  const response = await fetch(`${API_URL}/getResumesWithUsers?userid=${userid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serverfehler: ${errorText}`);
  }

  return await response.json();
};

export const getResumeById = async (id: number): Promise<Resume> => {
 console.log("🔹 123 API-Aufruf mit ID:", id);
  const response = await fetch(`${API_URL}/getResumeById/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Serverfehler: ${await response.text()}`);
  }

  return await response.json();
};
export const updateOrCreateResume = async (resume: Resume): Promise<void> => {
  const response = await fetch(`${API_URL}/updateOrCreateResume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Speichern der Bewerbung: ${response.statusText}`);
  }
};

export const getStates = async (): Promise<{ stateid: number; text: string }[]> => {
  const response = await fetch(`${API_URL}/getStates`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Status.");
  }

  return await response.json();
};

import { Contact } from "../../../interfaces/Contact";
import { Company } from '../../../interfaces/Company';
import { HistoryEntry } from '../../../interfaces/histori';

export const createOrUpdateContact = async (contact: Contact): Promise<void> => {
  // Setzt `contactid` auf 0, falls er nicht vorhanden ist (neuer Kontakt)
  const contactData = { ...contact, contactid: contact.contactid ?? 0 };

  const response = await fetch(`${API_URL}/createOrUpdateContact`, {
    method: "POST", // Backend entscheidet automatisch, ob Insert oder Update
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error("Fehler beim Speichern oder Aktualisieren des Kontakts: " + await response.text());
  }
};


export const getCompanies = async (loginId: number, isRecruter: boolean): Promise<Company[]> => {
  console.log("🔹 API-Aufruf getCompanies mit loginId:", loginId, "und isRecruter:", isRecruter);
  const response = await fetch(`${API_URL}/companies?loginId=${loginId}&isRecruter=${isRecruter||false}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Abrufen der Firmen: ${await response.text()}`);
  }

  return await response.json();
};
export const getContacts = async (loginId: number, companyId: number): Promise<Contact[]> => {
  const response = await fetch(`${API_URL}/contacts?ref=${loginId}&company=${companyId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Abrufen der Kontakte: ${await response.text()}`);
  }

  return await response.json();
};

export const getHistoryByResumeId = async (resumeId: number, refId: number): Promise<HistoryEntry[]> => {
    const url = `${API_URL}/getHistoryByResumeId?resumeId=${resumeId}&refId=${refId}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
    }
    return response.json();
};
export const changeResumeStatus = async (
  resumeId: number,
  userId: number,
  stateId: number,
  date: string
): Promise<void> => {
    const url = `${API_URL}/changeResumeStatus`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeId, userId, stateId, date }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Fehler beim Ändern des Status");
  }
};

interface UpdateAccessDataResponse {
  success?: boolean;
  message?: string;
  user?: User;
}

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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Fehler beim Speichern",
      };
    }

    return {
      success: true,
      message: result.message,
      user: result.user, // vom Backend zurückgegeben
    };
  } catch (error) {
    console.error("API-Fehler:", error);
    return {
      success: false,
      message: "Serverfehler oder keine Verbindung: \n" + error,
    };
  }
};

