import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';
import { getReportsCacheKey } from '../constants/storage';
import apiClient from '../services/apiClient';
import { uploadMultipartFile } from '../utils/uploadHelper';

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
      // Jika user belum login / tidak terautentikasi, jangan panggil endpoint reports
      if (!userProfile) {
        setIsLoadingReports(false);
        return;
      }

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
    [filterStatus, cacheKey, loadCachedReports, userProfile]
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
      const parameters = {
        title: title || 'Laporan Kerusakan Fasilitas',
        description,
      };
      if (location) {
        parameters.location_detail = location;
      }
      if (classroomId) {
        parameters.classroom_id = String(classroomId);
      }

      const res = await uploadMultipartFile({
        endpoint: API_ENDPOINTS.REPORTS,
        photoUri,
        fieldName: 'photo',
        parameters,
        defaultFileName: `photo_${Date.now()}`,
      });

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
    const res = await uploadMultipartFile({
      endpoint: API_ENDPOINTS.REPORT_EVIDENCE_PHOTO(reportId),
      photoUri,
      fieldName: 'photo',
      defaultFileName: `evidence_${reportId}_${Date.now()}`,
    });

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

  // Load data awal hanya jika user sudah login
  useEffect(() => {
    if (userProfile) {
      fetchReports(filterStatus);
    } else {
      setReports([]);
      setIsLoadingReports(false);
    }
  }, [filterStatus, userProfile]);

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
