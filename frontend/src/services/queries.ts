import { API_URL } from '../shared/api/queries';

const fetchStates = async (): Promise<{ stateid: number; text: string }[]> => {
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
