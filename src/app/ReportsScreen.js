import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getApiBaseUrl, API_ENDPOINTS } from '../constants/api';
import ReportFilterTabs from '../components/ReportFilterTabs';

export default function ReportsScreen({
  reports = [],
  isLoadingReports = false,
  reportsError = null,
  isRefreshing = false,
  filterStatus = 'Semua',
  setFilterStatus,
  handleRefresh,
  updateReportStatus,
  uploadEvidencePhoto,
  userProfile,
  authToken,
}) {
  // Modal State untuk Upload Bukti & Penyelesaian
  const [selectedReport, setSelectedReport] = useState(null);
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [evidencePhoto, setEvidencePhoto] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Modal State untuk Preview Foto
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Hitung jumlah per status
  const statusCounts = useMemo(() => {
    const counts = { semua: reports.length, menunggu: 0, diproses: 0, selesai: 0 };
    reports.forEach((r) => {
      const s = (r.status || '').toLowerCase();
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });
    return counts;
  }, [reports]);

  // Filter laporan berdasarkan tab aktif
  const filteredReports = useMemo(() => {
    if (!filterStatus || filterStatus === 'Semua') {
      return reports;
    }
    return reports.filter(
      (r) => (r.status || '').toLowerCase() === filterStatus.toLowerCase()
    );
  }, [reports, filterStatus]);

  // Helper untuk membuka modal upload bukti
  const handleOpenEvidenceModal = (report) => {
    setSelectedReport(report);
    setEvidencePhoto(null);
    setCompletionNote('');
    setEvidenceModalVisible(true);
  };

  // Pilih foto bukti dari galeri
  const handlePickEvidenceGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.75,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setEvidencePhoto({ uri: res.assets[0].uri });
      }
    } catch (err) {
      console.error('Gagal memilih foto bukti:', err);
      Alert.alert('Gagal', 'Tidak dapat membuka galeri perangkat');
    }
  };

  // Ambil foto bukti dari kamera
  const handlePickEvidenceCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Izin kamera diperlukan untuk mengambil foto bukti');
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        quality: 0.75,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setEvidencePhoto({ uri: res.assets[0].uri });
      }
    } catch (err) {
      console.error('Gagal mengambil foto dari kamera:', err);
      Alert.alert('Gagal', 'Tidak dapat membuka kamera perangkat');
    }
  };

  // Submit foto bukti dan ubah status ke 'selesai'
  const handleSubmitEvidenceAndComplete = async () => {
    if (!selectedReport) return;

    if (!evidencePhoto && !selectedReport.evidence_photo_url) {
      Alert.alert(
        'Foto Bukti Wajib',
        'Anda wajib melampirkan foto bukti perbaikan sebelum menandai laporan selesai.'
      );
      return;
    }

    setIsSubmittingEvidence(true);

    try {
      // 1. Upload foto bukti jika ada foto baru yang dipilih
      if (evidencePhoto?.uri) {
        await uploadEvidencePhoto(selectedReport.id, evidencePhoto.uri);
      }

      // 2. Update status ke 'selesai'
      await updateReportStatus(
        selectedReport.id,
        'selesai',
        completionNote.trim() || 'Perbaikan fasilitas telah selesai dikerjakan.'
      );

      setEvidenceModalVisible(false);
      setSelectedReport(null);
      setEvidencePhoto(null);
      setCompletionNote('');

      Alert.alert('Sukses 🎉', 'Laporan berhasil diselesaikan dan bukti perbaikan telah tersimpan.');
    } catch (err) {
      console.error('Gagal menyelesaikan perbaikan:', err);
      Alert.alert(
        'Gagal Menyelesaikan',
        err.message || 'Terjadi kesalahan saat memproses laporan'
      );
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Handler transisi cepat: menunggu -> diproses
  const handleProcessReport = (report) => {
    Alert.alert(
      'Mulai Perbaikan',
      `Ubah status laporan "${report.title}" menjadi Diproses?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Mulai Proses',
          onPress: async () => {
            try {
              await updateReportStatus(
                report.id,
                'diproses',
                'Laporan diterima oleh Admin dan teknisi mulai bertugas.'
              );
              Alert.alert('Status Diperbarui', 'Laporan kini berstatus "Diproses".');
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Gagal mengubah status');
            }
          },
        },
      ]
    );
  };

  // Format tanggal ramah pengguna
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Badge Status Style Helper
  const getBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'selesai':
        return {
          bg: '#DCFCE7',
          text: '#166534',
          label: 'Selesai',
        };
      case 'diproses':
        return {
          bg: '#E0F2FE',
          text: '#0369A1',
          label: 'Diproses',
        };
      default:
        return {
          bg: '#FEF3C7',
          text: '#92400E',
          label: 'Menunggu',
        };
    }
  };

  // Render Kartu Laporan Tugas Perbaikan
  const renderReportItem = ({ item }) => {
    const badge = getBadgeStyle(item.status);
    const baseUrl = getApiBaseUrl();

    // Resolusi URL foto authenticated
    const damagePhotoFullUrl = item.photo_url
      ? `${baseUrl}${API_ENDPOINTS.REPORT_PHOTO(item.id)}`
      : null;
    const evidencePhotoFullUrl = item.evidence_photo_url
      ? `${baseUrl}${API_ENDPOINTS.REPORT_EVIDENCE_PHOTO(item.id)}`
      : null;

    return (
      <View style={styles.card}>
        {/* Header Kartu: Judul & Badge Status */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>
              📍 {item.location_detail || item.classroom_name || 'Kampus'} • 👤{' '}
              {item.reporter_name || 'Mahasiswa'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Deskripsi Kerusakan */}
        {item.description ? (
          <Text style={styles.cardDescription}>{item.description}</Text>
        ) : null}

        {/* Baris Foto: Foto Kerusakan & Foto Bukti */}
        <View style={styles.photosRow}>
          {item.photo_url ? (
            <TouchableOpacity
              style={styles.photoThumbButton}
              onPress={() => {
                setPreviewTitle('Foto Kerusakan Awal');
                setPreviewPhotoUrl(damagePhotoFullUrl);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: damagePhotoFullUrl,
                  headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                }}
                style={styles.photoThumb}
                resizeMode="cover"
              />
              <Text style={styles.photoThumbLabel}>📸 Foto Kerusakan</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noPhotoBox}>
              <Text style={styles.noPhotoText}>Tanpa Foto Kerusakan</Text>
            </View>
          )}

          {item.evidence_photo_url ? (
            <TouchableOpacity
              style={styles.photoThumbButton}
              onPress={() => {
                setPreviewTitle('Foto Bukti Perbaikan (Admin)');
                setPreviewPhotoUrl(evidencePhotoFullUrl);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: evidencePhotoFullUrl,
                  headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                }}
                style={[styles.photoThumb, { borderColor: '#10B981' }]}
                resizeMode="cover"
              />
              <Text style={[styles.photoThumbLabel, { color: '#059669' }]}>
                ✅ Bukti Selesai
              </Text>
            </TouchableOpacity>
          ) : item.status === 'diproses' ? (
            <TouchableOpacity
              style={styles.uploadEvidencePrompt}
              onPress={() => handleOpenEvidenceModal(item)}
            >
              <Text style={styles.uploadEvidencePromptIcon}>📷</Text>
              <Text style={styles.uploadEvidencePromptText}>+ Tambah Bukti</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Footer: Waktu & Tombol Aksi Admin */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>🕒 {formatDate(item.created_at)}</Text>

          {/* Kontrol Aksi Transisi Status */}
          {item.status === 'menunggu' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.processButton]}
              onPress={() => handleProcessReport(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>⚙️ Proses Laporan</Text>
            </TouchableOpacity>
          )}

          {item.status === 'diproses' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleOpenEvidenceModal(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>
                {item.evidence_photo_url ? '✓ Tandai Selesai' : '📸 Upload Bukti & Selesai'}
              </Text>
            </TouchableOpacity>
          )}

          {item.status === 'selesai' && (
            <View style={styles.completedBadgeContainer}>
              <Text style={styles.completedCheckText}>✓ Tuntas Diperbaiki</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Halaman */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>
            Administrator • {userProfile?.name || 'Admin'}
          </Text>
          <Text style={styles.headerTitle}>Tugas Perbaikan Fasilitas</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs (Semua, Menunggu, Diproses, Selesai) */}
      <ReportFilterTabs
        activeFilter={filterStatus}
        onSelectFilter={setFilterStatus}
        counts={statusCounts}
      />

      {/* Konten Utama */}
      {isLoadingReports && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat tugas perbaikan fasilitas...</Text>
        </View>
      ) : reportsError && reports.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Gagal Memuat Laporan</Text>
          <Text style={styles.errorMessage}>{reportsError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#4F46E5']}
              tintColor="#4F46E5"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>Tidak Ada Tugas</Text>
              <Text style={styles.emptySubtext}>
                {filterStatus !== 'Semua'
                  ? `Tidak ada laporan dengan status "${filterStatus}".`
                  : 'Semua fasilitas kampus dalam kondisi baik atau laporan belum masuk.'}
              </Text>
              <TouchableOpacity style={styles.emptyRetryBtn} onPress={handleRefresh}>
                <Text style={styles.emptyRetryBtnText}>Periksa Ulang</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL: UPLOAD BUKTI PERBAIKAN & TANDAI SELESAI */}
      {/* ==================================================================== */}
      <Modal
        visible={evidenceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !isSubmittingEvidence && setEvidenceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload Bukti Perbaikan</Text>
            <Text style={styles.modalSubtitle}>
              Laporan: {selectedReport?.title}
            </Text>

            {/* Preview Foto Bukti Terpilih */}
            {evidencePhoto?.uri ? (
              <View style={styles.modalPreviewContainer}>
                <Image
                  source={{ uri: evidencePhoto.uri }}
                  style={styles.modalPreviewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={() => setEvidencePhoto(null)}
                >
                  <Text style={styles.changePhotoBtnText}>Ganti Foto</Text>
                </TouchableOpacity>
              </View>
            ) : selectedReport?.evidence_photo_url ? (
              <View style={styles.modalPreviewContainer}>
                <Image
                  source={{
                    uri: `${getApiBaseUrl()}${API_ENDPOINTS.REPORT_EVIDENCE_PHOTO(selectedReport.id)}`,
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                  }}
                  style={styles.modalPreviewImage}
                  resizeMode="cover"
                />
                <Text style={styles.existingEvidenceNote}>
                  Foto bukti sudah diunggah sebelumnya. Anda dapat menggantinya di bawah.
                </Text>
              </View>
            ) : (
              <View style={styles.photoPickerBox}>
                <Text style={styles.photoPickerPrompt}>
                  Pilih foto bukti hasil perbaikan fasilitas:
                </Text>
                <View style={styles.photoPickerButtons}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handlePickEvidenceCamera}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerBtnIcon}>📷</Text>
                    <Text style={styles.pickerBtnText}>Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={handlePickEvidenceGallery}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerBtnIcon}>🖼️</Text>
                    <Text style={styles.pickerBtnText}>Galeri</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Input Catatan Perbaikan */}
            <Text style={styles.noteLabel}>Catatan Perbaikan (Opsional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Contoh: AC telah dibersihkan dan freon diisi ulang"
              placeholderTextColor="#94A3B8"
              value={completionNote}
              onChangeText={setCompletionNote}
              multiline
              numberOfLines={2}
            />

            {/* Tombol Aksi Modal */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEvidenceModalVisible(false)}
                disabled={isSubmittingEvidence}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  isSubmittingEvidence && { opacity: 0.6 },
                ]}
                onPress={handleSubmitEvidenceAndComplete}
                disabled={isSubmittingEvidence}
              >
                {isSubmittingEvidence ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Selesaikan Tugas</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: PREVIEW FOTO FULL SCREEN */}
      {/* ==================================================================== */}
      <Modal
        visible={Boolean(previewPhotoUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhotoUrl(null)}
      >
        <View style={styles.photoPreviewOverlay}>
          <View style={styles.photoPreviewHeader}>
            <Text style={styles.photoPreviewTitle}>{previewTitle}</Text>
            <TouchableOpacity
              style={styles.closePreviewBtn}
              onPress={() => setPreviewPhotoUrl(null)}
            >
              <Text style={styles.closePreviewBtnText}>✕ Tutup</Text>
            </TouchableOpacity>
          </View>
          {previewPhotoUrl && (
            <Image
              source={{
                uri: previewPhotoUrl,
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
              }}
              style={styles.fullPreviewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerGreeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  refreshIconBtn: {
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
  },
  listContent: {
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginTop: 30,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorMessage: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyRetryBtn: {
    marginTop: 14,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyRetryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
    lineHeight: 18,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  photoThumbButton: {
    alignItems: 'center',
  },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: '#F1F5F9',
  },
  photoThumbLabel: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 4,
  },
  noPhotoBox: {
    height: 64,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  uploadEvidencePrompt: {
    width: 100,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#059669',
    borderStyle: 'dashed',
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadEvidencePromptIcon: {
    fontSize: 18,
  },
  uploadEvidencePromptText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  processButton: {
    backgroundColor: '#0284C7',
  },
  completeButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  completedBadgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  completedCheckText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  modalPreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  modalPreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  changePhotoBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  changePhotoBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  existingEvidenceNote: {
    fontSize: 11,
    color: '#059669',
    marginTop: 6,
    textAlign: 'center',
  },
  photoPickerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 8,
  },
  photoPickerPrompt: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoPickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  pickerBtnIcon: {
    fontSize: 16,
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 54,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  modalSubmitBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  photoPreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  photoPreviewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closePreviewBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closePreviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fullPreviewImage: {
    width: '90%',
    height: '75%',
  },
});
