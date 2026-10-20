import { useState, useEffect } from 'react';
import { getApiBaseUrl, API_ENDPOINTS } from '../constants/api';
import { getAuthToken } from './useAuth';

export const ROOMS_API_URL = `${getApiBaseUrl()}${API_ENDPOINTS.ROOMS}`;

/**
 * Mapping status ruang dari REST API sesuai spesifikasi Task 03:
 * empty       → Kosong
 * occupied    → Digunakan
 * upcoming    → Akan Digunakan
 * maintenance → Maintenance
 */
export const mapRoomStatus = (status) => {
  const normalized = (status || '').toString().toLowerCase().trim();
  switch (normalized) {
    case 'empty':
    case 'kosong':
      return {
        label: 'Kosong',
        bgColor: '#DCFCE7', // soft green
        textColor: '#166534', // dark green
      };
    case 'occupied':
    case 'digunakan':
      return {
        label: 'Digunakan',
        bgColor: '#FEE2E2', // soft red
        textColor: '#991B1B', // dark red
      };
    case 'upcoming':
      return {
        label: 'Akan Digunakan',
        bgColor: '#FEF3C7', // soft amber
        textColor: '#92400E', // dark amber
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        bgColor: '#F1F5F9', // soft slate
        textColor: '#475569', // slate
      };
    default:
      return {
        label: status || '-',
        bgColor: '#F3F4F6',
        textColor: '#374151',
      };
  }
};

const OFFLINE_ERROR_MESSAGE =
  'Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.';

const isNetworkError = (error) => {
  const message = error instanceof Error ? error.message : String(error || '');
  return /network request failed|failed to fetch|fetch failed|networkerror|internet disconnected|network is unreachable|connection (?:refused|reset|timed out)|err_connection_(?:refused|reset|timed_out)/i.test(
    message
  );
};

const getRoomsErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return OFFLINE_ERROR_MESSAGE;
  }

  return error instanceof Error && error.message
    ? error.message
    : 'Gagal terhubung ke server.';
};

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    setRoomsError(null);
    setIsOffline(false);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.ROOMS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(
          errorJson.error || 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.'
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP Error (${response.status}) saat mengambil data ruangan`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        // Mapping JSON response ke Data Model Room
        const mappedRooms = data.map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          capacity: item.capacity,
          location: item.location,
          facilities: item.facilities,
        }));
        setRooms(mappedRooms);
        setIsOffline(false);
      } else {
        throw new Error('Format data ruangan tidak valid dari server');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setIsOffline(isNetworkError(error));
      setRoomsError(getRoomsErrorMessage(error));
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRoomsError(null);
    setIsOffline(false);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.ROOMS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(
          errorJson.error || 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.'
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP Error (${response.status}) saat menyegarkan data ruangan`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        // Mapping JSON response ke Data Model Room
        const mappedRooms = data.map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          capacity: item.capacity,
          location: item.location,
          facilities: item.facilities,
        }));
        setRooms(mappedRooms);
        setRoomsError(null);
        setIsOffline(false);
      } else {
        throw new Error('Format data ruangan tidak valid dari server');
      }
    } catch (error) {
      console.error('Error refreshing rooms:', error);
      setIsOffline(isNetworkError(error));
      setRoomsError(getRoomsErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  };


  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    isLoadingRooms,
    roomsError,
    isOffline,
    isRefreshing,
    fetchRooms,
    handleRefresh,
  };
};

export default useRooms;
