// Centralized API Client for ALYSTRO
// Normalizes base URL whether set as https://alystro.vercel.app or https://alystro.vercel.app/api/v1

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (cleanUrl.endsWith('/api/v1')) {
      return cleanUrl;
    }
    if (cleanUrl.endsWith('/api')) {
      return `${cleanUrl}/v1`;
    }
    return `${cleanUrl}/api/v1`;
  }

  // If deployed in production and VITE_API_URL was omitted in Vercel settings,
  // default to the verified live backend production URL
  if (import.meta.env.PROD) {
    return 'https://alystro.vercel.app/api/v1';
  }

  // In local development, Vite proxies '/api' to 'http://localhost:5000'
  return '/api/v1';
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('alystro_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const base = getApiBaseUrl();
  let cleanEndpoint = endpoint.trim();

  // If endpoint already starts with http/https, use it directly
  let fullUrl: string;
  if (cleanEndpoint.startsWith('http://') || cleanEndpoint.startsWith('https://')) {
    fullUrl = cleanEndpoint;
  } else {
    // If endpoint starts with /api/v1, strip it to prevent duplicate prefixes
    if (cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
    }
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = `/${cleanEndpoint}`;
    }
    fullUrl = `${base}${cleanEndpoint}`;
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (netErr: any) {
    throw new ApiError(
      `Network connection error: Unable to reach ALYSTRO API server at ${base}. Please verify network connectivity.`,
      0
    );
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    // If server returned HTML (e.g. 404/502 from proxy or static fallback)
    const textData = await response.text().catch(() => '');
    if (!response.ok) {
      throw new ApiError(
        `Server returned ${response.status} (${response.statusText}): The requested resource was not found or failed on the backend.`,
        response.status
      );
    }
    data = { raw: textData };
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || `API request failed with status ${response.status}`,
      response.status,
      data?.errors
    );
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
  checkHealth: async () => {
    const base = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
    return apiRequest<{ status: string; database: string; timestamp: string }>(`${base}/api/health`, {
      method: 'GET',
    });
  },
};

