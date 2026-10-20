import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * ============================================================================
 * KONFIGURASI API & BASE URL BACKEND KAMPUSCARE
 * ============================================================================
 * Mendeteksi base URL backend secara dinamis berdasarkan platform dan konfigurasi.
 *
 * Prioritas Resolusi:
 * 1. process.env.EXPO_PUBLIC_API_URL (jika disetel di .env / .env.local)
 * 2. Platform-specific auto detection:
 *    - Expo Web: http://localhost:3000
 *    - Android Native:
 *      - Jika dijalankan melalui Expo Go / Metro di HP fisik: otomatis mengambil IP host Metro bundler (http://<ip>:3000)
 *      - Jika di Android Emulator (AVD): http://10.0.2.2:3000
 *    - iOS Simulator: http://localhost:3000
 * 3. Fallback: http://localhost:3000
 * ============================================================================
 */
export const getApiBaseUrl = () => {
  // 1. Prioritaskan environment variable EXPO_PUBLIC_API_URL jika tersedia
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Platform Web (Browser)
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // 3. Platform Android Native
  if (Platform.OS === 'android') {
    // Cek apakah ada hostUri dari Metro bundler (Expo Go / Dev Client di HP fisik)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3000`;
      }
    }
    // Default Android Emulator (10.0.2.2 memetakan ke localhost komputer host)
    return 'http://10.0.2.2:3000';
  }

  // 4. Platform iOS Simulator
  if (Platform.OS === 'ios') {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3000`;
      }
    }
    return 'http://localhost:3000';
  }

  // Default Fallback
  return 'http://localhost:3000';
};

/**
 * Daftar Endpoint REST API Backend KampusCare
 */
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
  ROOMS: '/api/rooms',
};
