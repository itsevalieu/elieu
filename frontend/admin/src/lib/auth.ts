import { newsletterApi } from './api';

export async function login(email: string, password: string) {
  return newsletterApi.post('/api/auth/login', { email, password });
}

export async function refresh() {
  return newsletterApi.post('/api/auth/refresh', {});
}

export async function logout() {
  return newsletterApi.post('/api/auth/logout', {});
}
