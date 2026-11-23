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

    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      throw new Error(
        "Email sudah terdaftar. Silakan gunakan email lain atau login."
      );
    }

    return {
      user: data.user,
      session: data.session,
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
