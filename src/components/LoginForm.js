import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';

export default function LoginForm({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  isSubmitting,
  handleLogin,
  handleFillDemoAccount,
}) {
  return (
    <View style={styles.formInnerContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Kampus</Text>
        <TextInput
          style={styles.textInput}
          placeholder="mahasiswa@kampuscare.ac.id"
          placeholderTextColor="#94A3B8"
          value={loginEmail}
          onChangeText={setLoginEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kata Sandi</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Masukkan kata sandi Anda"
          placeholderTextColor="#94A3B8"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Masuk ke KampusCare</Text>
        )}
      </TouchableOpacity>

      {/* Demo Credentials Helper */}
      <View style={styles.demoBox}>
        <View style={styles.demoHeaderRow}>
          <Text style={styles.demoTitle}>💡 Kredensial Mock Demo:</Text>
          <TouchableOpacity onPress={handleFillDemoAccount}>
            <Text style={styles.demoFillLink}>Gunakan Otomatis</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.demoText}>Email: mahasiswa@kampuscare.ac.id</Text>
        <Text style={styles.demoText}>Kata Sandi: password123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formInnerContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  demoBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  demoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3730A3',
  },
  demoFillLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  demoText: {
    fontSize: 12,
    color: '#4338CA',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
