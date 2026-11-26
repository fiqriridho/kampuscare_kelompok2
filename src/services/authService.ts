import { supabase } from "../lib/supabase";

export function formatAuthError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return "Email atau password salah. Silakan periksa kembali.";
    }
    if (
      msg.includes("user already registered") ||
      msg.includes("already registered")
    ) {
      return "Email sudah terdaftar. Silakan gunakan email lain atau login.";
    }
    if (msg.includes("password should be at least 6 characters")) {
      return "Password minimal 6 karakter.";
    }
    if (msg.includes("email not confirmed")) {
      return "Email belum dikonfirmasi.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Koneksi ke server gagal. Periksa koneksi internet Anda.";
    }
    if (msg.includes("timeout") || msg.includes("waktu tunggu")) {
      return "Server tidak merespons. Periksa koneksi internet lalu coba lagi.";
    }
    return error.message;
  }
  return "Terjadi kesalahan pada proses autentikasi. Silakan coba lagi.";
}

export const authService = {
  async signUp(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(
        "Registrasi belum dikonfirmasi oleh server. Akun belum dapat dipastikan tersimpan."
      );
    }

    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      throw new Error(
        "Email sudah terdaftar. Silakan gunakan email lain atau login."
      );
    }

    if (data.session) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(
          "Akun terdaftar, tetapi sesi registrasi tidak dapat ditutup. Silakan login kembali."
        );
      }
    }

    return {
      user: data.user,
      session: null,
    };
  },

  async signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.session || !data.user) {
      throw new Error(
        "Login tidak dikonfirmasi oleh server. Silakan coba lagi."
      );
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session;
  },
};
