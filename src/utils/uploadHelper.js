import { Platform } from 'react-native';
import { getApiBaseUrl } from '../constants/api';
import { getAuthToken } from '../hooks/useAuth';
import { ApiError } from '../services/apiClient';

/**
 * Melakukan upload multipart secara handal di Expo / React Native.
 * 
 * Di Expo Go pada perangkat fisik Android/iOS:
 * Standar `fetch` + `FormData` sering mengalami:
 * 1. "Unsupported FormDataPart implementation" saat memakai expo/fetch jika formatnya {uri, name, type}
 * 2. "Network request failed" jika memakai new File() atau Blob pada native runtime.
 * 
 * Modul ini menggunakan strategi:
 * 1. Di Native (Android/iOS): Menggunakan `expo-file-system` uploadAsync dengan Multipart.
 *    Metode ini menggunakan native HTTP client internal (OkHttp di Android / NSURLSession di iOS)
 *    yang 100% stabil untuk streaming upload foto tanpa masalah boundary / FormDataPart.
 * 2. Di Web / Fallback: Menggunakan fetch multipart biasa.
 */
export async function uploadMultipartFile({
  endpoint,
  photoUri,
  fieldName = 'photo',
  parameters = {},
  defaultFileName = 'photo.jpg',
}) {
  const baseUrl = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const token = await getAuthToken();

  const uriParts = photoUri ? photoUri.split('.') : [];
  const ext = (uriParts[uriParts.length - 1] || 'jpg').toLowerCase().split('?')[0];
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const fileName = defaultFileName.endsWith(`.${ext}`) ? defaultFileName : `${defaultFileName}.${ext}`;

  // STRATEGI 1: Gunakan expo-file-system uploadAsync pada Native (Android / iOS)
  if (Platform.OS !== 'web' && photoUri && (photoUri.startsWith('file:') || photoUri.startsWith('content:'))) {
    try {
      // Prioritaskan legacy import jika ada, atau root expo-file-system
      let FileSystem;
      try {
        FileSystem = require('expo-file-system/legacy');
      } catch {
        FileSystem = require('expo-file-system');
      }

      if (FileSystem && typeof FileSystem.uploadAsync === 'function') {
        const uploadType =
          FileSystem.FileSystemUploadType?.MULTIPART ||
          FileSystem.UploadType?.MULTIPART ||
          'MULTIPART';

        const headers = {
          Accept: 'application/json',
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // uploadAsync membutuhkan parameters dalam bentuk string key-value
        const stringParams = {};
        for (const [key, value] of Object.entries(parameters)) {
          if (value !== null && value !== undefined) {
            stringParams[key] = String(value);
          }
        }

        const result = await FileSystem.uploadAsync(fullUrl, photoUri, {
          httpMethod: 'POST',
          uploadType,
          fieldName,
          mimeType,
          headers,
          parameters: stringParams,
        });

        const status = result.status;
        let data = {};
        try {
          data = JSON.parse(result.body);
        } catch {
          data = { message: result.body };
        }

        if (status >= 200 && status < 300) {
          return data;
        }

        throw new ApiError(data.error || `Upload gagal dengan status ${status}`, status, data);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn('[uploadMultipartFile] Native uploadAsync gagal, beralih ke FormData fallback:', err.message);
    }
  }

  // STRATEGI 2: Standard FormData + Fetch (Untuk Web atau jika uploadAsync tidak tersedia)
  if (Platform.OS === 'web') {
    try {
      const photoResponse = await fetch(photoUri);
      const photoBlob = await photoResponse.blob();
      const photoDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoBlob);
      });

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...parameters,
          photo_base64: photoDataUrl,
          photo_name: fileName,
        }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(
          resData.error || `Upload gagal dengan status ${response.status}`,
          response.status,
          resData
        );
      }
      return resData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'Foto laporan tidak dapat dibaca oleh browser. Ambil ulang atau pilih foto lain.',
        400,
        { cause: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  }

  if (photoUri) {
    if (Platform.OS === 'web' || photoUri.startsWith('blob:') || photoUri.startsWith('data:')) {
      try {
        const res = await fetch(photoUri);
        const blob = await res.blob();
        formData.append(fieldName, blob, fileName);
        if (!blob.type) {
          blob.type = mimeType;
        }
      } catch (error) {
        throw new ApiError(
          'Foto laporan tidak dapat dibaca oleh browser. Ambil ulang atau pilih foto lain.',
          400,
          { cause: error instanceof Error ? error.message : String(error) }
        );
      }
    } else {
      formData.append(fieldName, {
        uri: photoUri,
        name: fileName,
        type: mimeType,
      });
    }
  }

  const finalHeaders = {
    Accept: 'application/json',
  };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: finalHeaders,
    body: formData,
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(resData.error || `Upload gagal dengan status ${response.status}`, response.status, resData);
  }

  return resData;
}
