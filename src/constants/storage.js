// ============================================================================
// STORAGE KEYS & ARCHITECTURE (PEMISAHAN DATA SECARA KETAT)
// ============================================================================
// • SecureStore  : HANYA untuk token/session otentikasi pada platform native (Android & iOS).
// • AsyncStorage : HANYA untuk data non-sensitif (user profile & riwayat pelaporan).
// • Password     : TIDAK PERNAH disimpan di AsyncStorage, SecureStore, localStorage, atau log.
// • Token        : TIDAK PERNAH disimpan di AsyncStorage atau localStorage.
// ============================================================================

export const SECURE_TOKEN_KEY = 'kampuscare_auth_token';
export const ASYNC_PROFILE_KEY = '@kampuscare_user_profile';
export const ASYNC_HISTORY_KEY = '@kampuscare_report_history';
