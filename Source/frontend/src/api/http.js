const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message?.message || data?.message || 'Ошибка запроса';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data;
}
