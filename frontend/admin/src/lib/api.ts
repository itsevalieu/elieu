const NEWSLETTER_API = process.env.NEXT_PUBLIC_NEWSLETTER_API_URL || 'http://localhost:8081';
const PORTFOLIO_API = process.env.NEXT_PUBLIC_PORTFOLIO_API_URL || 'http://localhost:8080';

async function adminFetch<T>(base: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const newsletterApi = {
  get: <T>(path: string) => adminFetch<T>(NEWSLETTER_API, path),
  post: <T>(path: string, body: unknown) => adminFetch<T>(NEWSLETTER_API, path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => adminFetch<T>(NEWSLETTER_API, path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => adminFetch<T>(NEWSLETTER_API, path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => adminFetch<T>(NEWSLETTER_API, path, { method: 'DELETE' }),
};

export const portfolioApi = {
  get: <T>(path: string) => adminFetch<T>(PORTFOLIO_API, path),
  post: <T>(path: string, body: unknown) => adminFetch<T>(PORTFOLIO_API, path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => adminFetch<T>(PORTFOLIO_API, path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => adminFetch<T>(PORTFOLIO_API, path, { method: 'DELETE' }),
};
