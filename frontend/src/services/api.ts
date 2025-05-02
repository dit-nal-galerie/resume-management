const API_URL = 'http://localhost:3001';
import { User } from '../../../interfaces/User';
import { Resume } from "../../../interfaces/Resume";
// Функция для создания нового пользователя
export const createUser = async (userData: User): Promise<string> => {
  const response = await fetch(`${API_URL}/createUser`, {
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

  const response = await fetch(`${API_URL}/updateUserData`, {
    method: "PUT",
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