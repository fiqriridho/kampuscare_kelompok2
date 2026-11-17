import { getApiBaseUrl } from '../constants/api';
import { getAuthToken } from '../hooks/useAuth';
import authHandler from './authHandler';

const DEFAULT_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Melakukan HTTP request terpusat dengan timeout, Bearer token, dan penanganan 401
 */
async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    isMultipart = false,
  } = options;

  const baseUrl = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = await getAuthToken();
    const finalHeaders = {
      Accept: 'application/json',
      ...headers,
    };

    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }

    // Untuk multipart/form-data, jangan set Content-Type manual agar fetch
    // menginjeksi boundary multipart secara otomatis.
    if (!isMultipart && body && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(fullUrl, {
      method,
      headers: finalHeaders,
      body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // Tangani respons 401 (Unauthorized / Token Expired / Blacklisted)
    if (response.status === 401) {
      authHandler.emit401();
      const errData = await response.json().catch(() => ({}));
      throw new ApiError(
        errData.error || 'Sesi telah kedaluwarsa. Silakan login kembali.',
        401,
        errData
      );
    }

    // Parse JSON
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.error || `Request gagal dengan status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timer);

    // Tangani timeout AbortController
    if (error.name === 'AbortError') {
      console.warn(`[apiClient] Request timeout ke: ${fullUrl}`);
      throw new ApiError('Koneksi waktu habis (timeout). Silakan coba lagi.', 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error || '');
    console.warn(`[apiClient] Gagal fetch ke ${fullUrl}:`, message);

    const isNetwork = /network request failed|failed to fetch|fetch failed|networkerror|internet disconnected|connection (?:refused|reset|timed out)/i.test(
      message
    );

    if (isNetwork) {
      throw new ApiError(
        'Tidak ada koneksi internet atau server backend sedang offline.',
        0
      );
    }

    throw new ApiError(message || 'Terjadi kesalahan pada jaringan', 0);
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  postMultipart: (endpoint, formData, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      isMultipart: true,
    }),
};

export default apiClient;
