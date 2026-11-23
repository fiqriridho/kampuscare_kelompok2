import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../context/AuthContext";
import { authService, formatAuthError } from "../services/authService";
import { styles } from "../style/UIstyles";

export default function Login() {
  const router = useRouter();
  const { lastRegisteredEmail } = useAuth();

  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailValue = email !== null ? email : (lastRegisteredEmail ?? "");

  const handleLogin = async () => {
    if (isSubmitting) return;

    const normalizedEmail = emailValue.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError("Format email tidak valid.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await authService.signIn(normalizedEmail, password);

      setPassword("");
      router.replace("/");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.loginKeyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.loginCard}>
          <View style={styles.loginBrandMark}>
            <Text style={styles.loginBrandMarkText}>K</Text>
          </View>

          <Text style={styles.loginTitle}>Selamat Datang Kembali</Text>

          <Text style={styles.loginSubtitle}>
            Masuk untuk mengakses KampusCare
          </Text>

          <View style={styles.loginForm}>
            <View style={styles.loginFormGroup}>
              <Text style={styles.loginLabel}>Email</Text>

              <TextInput
                style={styles.loginInput}
                placeholder="nama@email.com"
                placeholderTextColor="#94A3B8"
                value={emailValue}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.loginFormGroup}>
              <Text style={styles.loginLabel}>Password</Text>

              <View style={styles.loginPasswordWrapper}>
                <TextInput
                  style={styles.loginPasswordInput}
                  placeholder="Masukkan password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleLogin()}
                  editable={!isSubmitting}
                />

                <TouchableOpacity
                  style={styles.loginPasswordToggle}
                  onPress={() => setShowPassword((visible) => !visible)}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  <Text style={styles.loginPasswordToggleText}>
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.loginErrorContainer}>
                <Text style={styles.loginErrorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => void handleLogin()}
              disabled={isSubmitting}
              accessibilityState={{ disabled: isSubmitting }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginSignupRow}>
              <Text style={styles.loginSignupText}>Belum punya akun?</Text>

              <TouchableOpacity
                onPress={() => router.push("/signup")}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text style={styles.loginSignupLink}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
