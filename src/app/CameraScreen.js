import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function CameraScreen({ handleCreateNewReport }) {
  return (
    <View style={styles.cameraScreenContainer}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraIcon}>📸</Text>
        <Text style={styles.cameraTitle}>Shortcut Laporan Kerusakan</Text>
        <Text style={styles.cameraSubtitle}>
          Arahkan kamera ke fasilitas yang rusak untuk membuat laporan secara cepat.
        </Text>
        <TouchableOpacity
          style={styles.captureButton}
          activeOpacity={0.8}
          onPress={handleCreateNewReport}
        >
          <Text style={styles.captureButtonText}>Ambil Foto & Buat Laporan</Text>
        </TouchableOpacity>
        <Text style={styles.cameraNote}>
          *Data laporan tersimpan ke Local Storage (AsyncStorage)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cameraPlaceholder: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cameraIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  captureButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cameraNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
  },
});
