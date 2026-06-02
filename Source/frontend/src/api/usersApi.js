import { request } from './http';

export function getUsers() {
  return request('/users');
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id) {
  return request(`/users/${id}`, {
    method: 'DELETE',
  });
}