import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { mockClassrooms, mockReports } from '../constants/mockData';
import ClassroomCard from '../components/ClassroomCard';
import ReportCard from '../components/ReportCard';

export default function HomeScreen({ userProfile }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Halo, {userProfile?.name || 'Mahasiswa'} 👋</Text>
          <Text style={styles.brandTitle}>KampusCare</Text>
        </View>
        <Image
          source={{ uri: userProfile?.avatar || 'https://krs.umm.ac.id/Poto/2024/202410370110167.JPG' }}
          style={styles.headerAvatar}
        />
      </View>

      {/* Main Menu Shortcuts / Hero Cards */}
      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={[styles.menuCard, { backgroundColor: '#4F46E5' }]} activeOpacity={0.8}>
          <Text style={styles.menuIconText}>🏫</Text>
          <Text style={styles.menuCardTitle}>Ruang Kelas</Text>
          <Text style={styles.menuCardSubtitle}>Cek Status Ruangan Kosong</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuCard, { backgroundColor: '#0EA5E9' }]} activeOpacity={0.8}>
          <Text style={styles.menuIconText}>🛠️</Text>
          <Text style={styles.menuCardTitle}>Fasilitas & Laporan</Text>
          <Text style={styles.menuCardSubtitle}>Laporkan Kerusakan Kampus</Text>
        </TouchableOpacity>
      </View>

      {/* Status Ruang Kelas Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Status Ruang Kelas</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {mockClassrooms.map((item) => (
          <ClassroomCard key={item.id} item={item} />
        ))}
      </ScrollView>

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
});
