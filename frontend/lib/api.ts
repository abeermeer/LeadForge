const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return fetch(url, { ...options, headers });
}
