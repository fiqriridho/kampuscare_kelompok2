import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

export default function RegisterForm({
  regName,
  setRegName,
  regNim,
  setRegNim,
  regMajor,
  setRegMajor,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  regConfirmPassword,
  setRegConfirmPassword,
  isSubmitting,
  handleRegister,
}) {
  return (
    <View style={styles.formInnerContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nama Lengkap</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Contoh: Fiqri Ridho"
          placeholderTextColor="#94A3B8"
          value={regName}
          onChangeText={setRegName}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>NIM</Text>
          <TextInput
            style={styles.textInput}
            placeholder="202410370110..."
            placeholderTextColor="#94A3B8"
            value={regNim}
            onChangeText={setRegNim}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Program Studi</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Informatika"
            placeholderTextColor="#94A3B8"
            value={regMajor}
            onChangeText={setRegMajor}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Kampus</Text>
        <TextInput
          style={styles.textInput}
          placeholder="nama@kampuscare.ac.id"
          placeholderTextColor="#94A3B8"
          value={regEmail}
          onChangeText={setRegEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kata Sandi (Minimal 6 Karakter)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Kombinasi huruf & angka"
          placeholderTextColor="#94A3B8"
          value={regPassword}
          onChangeText={setRegPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Konfirmasi Kata Sandi</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ulangi kata sandi"
          placeholderTextColor="#94A3B8"
          value={regConfirmPassword}
          onChangeText={setRegConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Daftar Sekarang</Text>
        )}
      </TouchableOpacity>
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
  inputRow: {
    flexDirection: 'row',
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
});
