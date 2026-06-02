import { request } from './http';

export function getTrees() {
  return request('/trees');
}

export function getNestedTree(id) {
  return request(`/trees/${id}/nested`);
}

export function createTree(payload) {
  return request('/trees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTree(id, payload) {
  return request(`/trees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function createNode(payload) {
  return request('/tree-nodes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateNode(id, payload) {
  return request(`/tree-nodes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteNode(id) {
  return request(`/tree-nodes/${id}`, { method: 'DELETE' });
}