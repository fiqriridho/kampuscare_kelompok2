import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated, isReady, storageError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleSignup = async () => {
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      setSuccess(false);
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError("Format email tidak valid.");
      setSuccess(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      setSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);
    setSuccessMessage("");

    try {
      await authService.signUp(normalizedEmail, password);

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage(
        "Pendaftaran berhasil! Akun Anda telah dibuat. Silakan masuk."
      );
    } catch (err) {
      setError(formatAuthError(err));
      setSuccess(false);
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
        <ScrollView
          contentContainerStyle={styles.signupScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginCard}>
            <View style={styles.loginBrandMark}>
              <Text style={styles.loginBrandMarkText}>K</Text>
            </View>

            <Text style={styles.loginTitle}>Buat Akun</Text>
            <Text style={styles.loginSubtitle}>
              Daftar untuk mulai menggunakan KampusCare
            </Text>

            <View style={styles.loginForm}>
              <View style={styles.loginFormGroup}>
                <Text style={styles.loginLabel}>Email</Text>

                <TextInput
                  style={styles.loginInput}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError("");
                    if (success) setSuccess(false);
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
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError("");
                      if (success) setSuccess(false);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
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

              <View style={styles.loginFormGroup}>
                <Text style={styles.loginLabel}>Konfirmasi Password</Text>

                <TextInput
                  style={styles.loginInput}
                  placeholder="Ulangi password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (error) setError("");
                    if (success) setSuccess(false);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSignup()}
                  editable={!isSubmitting}
                />
              </View>

              {error ? (
                <View style={styles.loginErrorContainer}>
                  <Text style={styles.loginErrorText}>{error}</Text>
                </View>
              ) : null}

              {storageError ? (
                <View style={styles.loginErrorContainer}>
                  <Text style={styles.loginErrorText}>{storageError}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.signupSuccessContainer}>
                  <Text style={styles.signupSuccessText}>{successMessage}</Text>
                </View>
              ) : null}

              {success ? (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.replace("/login")}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <Text style={styles.loginButtonText}>Login sekarang</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => void handleSignup()}
                  disabled={!isReady || Boolean(storageError) || isSubmitting}
                  accessibilityState={{
                    disabled: !isReady || Boolean(storageError) || isSubmitting,
                  }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Daftar"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Daftar</Text>
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.loginSignupRow}>
                <Text style={styles.loginSignupText}>Sudah punya akun?</Text>

                <TouchableOpacity
                  onPress={() => router.replace("/login")}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                >
                  <Text style={styles.loginSignupLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
