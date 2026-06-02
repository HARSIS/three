import { request } from './http';

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}