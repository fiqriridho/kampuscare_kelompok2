import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';
import { getReportsCacheKey } from '../constants/storage';
import apiClient from '../services/apiClient';

export const useReports = (userProfile = null) => {
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Semua');

  const cacheKey = getReportsCacheKey(userProfile?.id || userProfile?.email);

  // Membaca cache laporan dari AsyncStorage
  const loadCachedReports = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setReports(parsed);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat cache laporan:', err);
    }
  }, [cacheKey]);

  // Mengambil daftar laporan dari backend
  const fetchReports = useCallback(
    async (statusParam = filterStatus) => {
      setIsLoadingReports(true);
      setReportsError(null);

      try {
        let endpoint = API_ENDPOINTS.REPORTS;
        if (statusParam && statusParam !== 'Semua') {
          endpoint += `?status=${encodeURIComponent(statusParam.toLowerCase())}`;
        }

        const res = await apiClient.get(endpoint);
        const data = res?.data || [];

        setReports(data);
        setReportsError(null);

        // Perbarui cache lokal
        if (statusParam === 'Semua') {
          await AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {});
        }
      } catch (err) {
        console.error('Error fetching reports:', err.message);
        setReportsError(err.message || 'Gagal memuat daftar laporan');
        // Fallback gunakan cache jika ada
        await loadCachedReports();
      } finally {
        setIsLoadingReports(false);
      }
    },
    [filterStatus, cacheKey, loadCachedReports]
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setReportsError(null);
    try {
      let endpoint = API_ENDPOINTS.REPORTS;
      if (filterStatus && filterStatus !== 'Semua') {
        endpoint += `?status=${encodeURIComponent(filterStatus.toLowerCase())}`;
      }
      const res = await apiClient.get(endpoint);
      const data = res?.data || [];
      setReports(data);
      if (filterStatus === 'Semua') {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {});
      }
    } catch (err) {
      console.error('Error refreshing reports:', err.message);
      setReportsError(err.message || 'Gagal menyegarkan data');
    } finally {
      setIsRefreshing(false);
    }
  }, [filterStatus, cacheKey]);

  // Membuat laporan baru oleh mahasiswa
  const createReport = useCallback(
    async ({ title, description, location, photoUri, classroomId = null }) => {
      const formData = new FormData();
      formData.append('title', title || 'Laporan Kerusakan Fasilitas');
      formData.append('description', description);
      if (location) {
        formData.append('location_detail', location);
      }
      if (classroomId) {
        formData.append('classroom_id', String(classroomId));
      }

      if (photoUri) {
        // Ambil nama file dan format extension
        const uriParts = photoUri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        formData.append('photo', {
          uri: photoUri,
          name: `photo_${Date.now()}.${fileType}`,
          type: `image/${fileType === 'png' ? 'png' : fileType === 'webp' ? 'webp' : 'jpeg'}`,
        });
      }

      const res = await apiClient.postMultipart(API_ENDPOINTS.REPORTS, formData);
      const createdItem = res?.data;

      if (createdItem) {
        setReports((prev) => [createdItem, ...prev]);
      }

      return createdItem;
    },
    []
  );

  // Admin memperbarui status laporan (menunggu -> diproses -> selesai)
  const updateReportStatus = useCallback(async (reportId, status, note = '') => {
    const res = await apiClient.patch(API_ENDPOINTS.REPORT_BY_ID(reportId), {
      status,
      note,
    });
    const updated = res?.data;

    if (updated) {
      setReports((prev) =>
        prev.map((item) => (Number(item.id) === Number(reportId) ? { ...item, ...updated } : item))
      );
    }

    return updated;
  }, []);

  // Admin mengunggah foto bukti perbaikan
  const uploadEvidencePhoto = useCallback(async (reportId, photoUri) => {
    const formData = new FormData();
    const uriParts = photoUri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';
    formData.append('photo', {
      uri: photoUri,
      name: `evidence_${reportId}_${Date.now()}.${fileType}`,
      type: `image/${fileType === 'png' ? 'png' : fileType === 'webp' ? 'webp' : 'jpeg'}`,
    });

    const res = await apiClient.postMultipart(
      API_ENDPOINTS.REPORT_EVIDENCE_PHOTO(reportId),
      formData
    );
    const evidenceUrl = res?.evidence_photo_url;

    if (evidenceUrl) {
      setReports((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(reportId)
            ? { ...item, evidence_photo_url: evidenceUrl }
            : item
        )
      );
    }

    return res;
  }, []);

  // Mengambil riwayat status laporan
  const getReportHistory = useCallback(async (reportId) => {
    const res = await apiClient.get(API_ENDPOINTS.REPORT_HISTORY(reportId));
    return res?.data || [];
  }, []);

  // Load data awal
  useEffect(() => {
    fetchReports(filterStatus);
  }, [filterStatus]);

  return {
    reports,
    isLoadingReports,
    reportsError,
    isRefreshing,
    filterStatus,
    setFilterStatus,
    fetchReports,
    handleRefresh,
    createReport,
    updateReportStatus,
    uploadEvidencePhoto,
    getReportHistory,
  };
};

export default useReports;
