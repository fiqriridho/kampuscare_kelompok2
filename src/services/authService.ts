import { supabase } from "../lib/supabase";

export const authService = {
  // Sign Up
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return data;
  },

  // Sign In
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  },

  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },
};