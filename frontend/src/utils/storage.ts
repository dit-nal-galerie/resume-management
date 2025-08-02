import { Anrede } from '../../../interfaces/Contact';
import { getAnrede, getStates } from '../services/api';

// export const loadUserFromStorage = () => {
//   const userData = localStorage.getItem('user');
//   return userData ? JSON.parse(userData) : null;
// };

export const getCachedAnrede = async (): Promise<Anrede[]> => {
  const cached = sessionStorage.getItem('anredeList');
  if (cached) {
    return JSON.parse(cached);
  }
  const data = await getAnrede();
  sessionStorage.setItem('anredeList', JSON.stringify(data));
  return data;
};

let statesCache: { stateid: number; text: string }[] | null = null;

export const getCachedStates = async (): Promise<{ stateid: number; text: string }[]> => {
  if (statesCache) {
    return statesCache;
  }
  const data = await getStates();
  statesCache = data;
  return data;
};
