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
export const updateUserData = async (
  loginid: number,
  userData: Partial<User>
): Promise<string> => {
  const response = await fetch(`${API_URL}/updateUserData`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loginid, userData }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при обновлении данных пользователя');
  }

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
  const response = await fetch(`${API_URL}/getResumeById/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Serverfehler: ${await response.text()}`);
  }

  return await response.json();
};

export const updateResume = async (resume: Resume): Promise<void> => {
  const response = await fetch(`${API_URL}/updateResume`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resume), // Direkt das komplette `Resume`-Objekt senden
  });

  if (!response.ok) {
    throw new Error("Fehler beim Aktualisieren der Bewerbung." + await response.text());
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