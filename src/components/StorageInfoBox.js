import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

export default function StorageInfoBox() {
  return (
    <View style={styles.storageInfoBox}>
      <Text style={styles.storageInfoTitle}>Arsitektur Penyimpanan & Keamanan:</Text>
      {Platform.OS !== 'web' ? (
        <Text style={styles.storageInfoItem}>
          🔐 <Text style={{ fontWeight: '700' }}>SecureStore (Native):</Text> Token sesi disimpan aman terenkripsi (Android Keystore / iOS Keychain)
        </Text>
      ) : (
        <Text style={styles.storageInfoItem}>
          💻 <Text style={{ fontWeight: '700' }}>Expo Web (Development/Demo):</Text> In-memory session (SecureStore hanya didukung pada platform native Android/iOS; token tidak disimpan di localStorage/AsyncStorage)
        </Text>
      )}
      <Text style={styles.storageInfoItem}>
        📁 <Text style={{ fontWeight: '700' }}>AsyncStorage:</Text> Profil & riwayat pelaporan (Data Non-Sensitif)
      </Text>
      <Text style={styles.storageInfoItem}>
        🛡️ <Text style={{ fontWeight: '700' }}>Aturan Privasi:</Text> Password tidak pernah disimpan ke penyimpanan lokal ataupun log
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  storageInfoBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
  },
  storageInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  storageInfoItem: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },
});
