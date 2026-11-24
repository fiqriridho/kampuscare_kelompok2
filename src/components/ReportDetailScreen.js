import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_ENDPOINTS } from '../constants/api';
import { apiClient } from '../services/apiClient';

export default function ReportDetailScreen({ reportId, onBack }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await apiClient.get(API_ENDPOINTS.REPORT_BY_ID(reportId));
      if (!response?.data) {
        throw new Error('Detail laporan tidak ditemukan.');
      }
      setReport(response.data);
    } catch (error) {
      console.error('Gagal memuat detail laporan:', error);
      setErrorMessage(error.message || 'Detail laporan tidak dapat dimuat.');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Kembali ke Home</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.stateText}>Memuat detail laporan...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={loadReport} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Detail Laporan</Text>
          <Text style={styles.title}>{report.title || 'Laporan Kerusakan Fasilitas'}</Text>
          <Text style={styles.status}>
            Status: {String(report.status || 'menunggu')}
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>Lokasi</Text>
            <Text style={styles.value}>
              {report.location_detail || report.location || 'Tidak tersedia'}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Deskripsi</Text>
            <Text style={styles.value}>{report.description || 'Tidak ada deskripsi.'}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.value}>
              {report.created_at
                ? new Date(report.created_at).toLocaleString('id-ID')
                : 'Tidak tersedia'}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heading: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  status: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  section: {
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 16,
  },
  label: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  value: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    color: '#64748B',
    marginTop: 12,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
