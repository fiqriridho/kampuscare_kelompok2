import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { mockReports } from '../constants/mockData';
import ClassroomCard from '../components/ClassroomCard';
import ReportCard from '../components/ReportCard';
import useRooms from '../hooks/useRooms';

export default function HomeScreen({ userProfile }) {
  const {
    rooms,
    isLoadingRooms,
    roomsError,
    isRefreshing,
    fetchRooms,
    handleRefresh,
  } = useRooms();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#4F46E5']}
          tintColor="#4F46E5"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>
            Halo, {userProfile?.name || 'Mahasiswa'} 👋
          </Text>
          <Text style={styles.brandTitle}>KampusCare</Text>
        </View>
        <Image
          source={{
            uri:
              userProfile?.avatar ||
              'https://krs.umm.ac.id/Poto/2024/202410370110167.JPG',
          }}
          style={styles.headerAvatar}
        />
      </View>

      {/* Main Menu Shortcuts / Hero Cards */}
      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: '#4F46E5' }]}
          activeOpacity={0.8}
          onPress={fetchRooms}
        >
          <Text style={styles.menuIconText}>🏫</Text>
          <Text style={styles.menuCardTitle}>Ruang Kelas</Text>
          <Text style={styles.menuCardSubtitle}>Cek Status Ruangan Kosong</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: '#0EA5E9' }]}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIconText}>🛠️</Text>
          <Text style={styles.menuCardTitle}>Fasilitas & Laporan</Text>
          <Text style={styles.menuCardSubtitle}>Laporkan Kerusakan Kampus</Text>
        </TouchableOpacity>
      </View>

      {/* Status Ruang Kelas Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Status Ruang Kelas</Text>
        <TouchableOpacity onPress={fetchRooms} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Muat Ulang</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoadingRooms ? (
        <View style={styles.roomLoadingContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.roomLoadingText}>Memuat ketersediaan ruangan...</Text>
        </View>
      ) : roomsError ? (
        /* Error State + Retry */
        <View style={styles.roomErrorContainer}>
          <Text style={styles.roomErrorIcon}>⚠️</Text>
          <View style={styles.roomErrorTextContainer}>
            <Text style={styles.roomErrorTitle}>Gagal Memuat Data Ruangan</Text>
            <Text style={styles.roomErrorMessage}>{roomsError}</Text>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRooms}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <View style={styles.roomEmptyContainer}>
          <Text style={styles.roomEmptyIcon}>📭</Text>
          <Text style={styles.roomEmptyTitle}>Tidak Ada Data Ruangan</Text>
          <Text style={styles.roomEmptyText}>
            Saat ini belum ada data ruangan yang tersedia.
          </Text>
          <TouchableOpacity
            style={styles.emptyRetryButton}
            onPress={fetchRooms}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyRetryButtonText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Data Ruangan dari REST API */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {rooms.map((item) => (
            <ClassroomCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}

      {/* Laporan Kerusakan Teratas */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Laporan Kerusakan Teratas</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {mockReports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
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
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  menuContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  menuCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuIconText: {
    fontSize: 28,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  menuCardSubtitle: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  roomLoadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    minHeight: 110,
    gap: 8,
  },
  roomLoadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  roomErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    gap: 12,
  },
  roomErrorIcon: {
    fontSize: 24,
  },
  roomErrorTextContainer: {
    flex: 1,
  },
  roomErrorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  roomErrorMessage: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roomEmptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    minHeight: 110,
  },
  roomEmptyIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  roomEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  roomEmptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyRetryButton: {
    marginTop: 10,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
