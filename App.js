import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock Data
const mockClassrooms = [
  { id: '1', name: 'Lab Komputer 1', building: 'Gedung A', status: 'kosong', capacity: 40 },
  { id: '2', name: 'Ruang 204', building: 'Gedung B', status: 'digunakan', capacity: 35 },
  { id: '3', name: 'Auditorium Utama', building: 'Gedung Rektorat', status: 'kosong', capacity: 150 },
  { id: '4', name: 'Ruang 102', building: 'Gedung A', status: 'digunakan', capacity: 30 },
];

const mockReports = [
  { id: '1', title: 'AC Mati & Bising', location: 'Lab Komputer 1', status: 'Diproses', date: '22 Sep 2026', votes: 14 },
  { id: '2', title: 'Proyektor Redup / Off', location: 'Ruang 204', status: 'Menunggu', date: '21 Sep 2026', votes: 9 },
  { id: '3', title: 'Kursi Patah (2 unit)', location: 'Ruang 102', status: 'Selesai', date: '19 Sep 2026', votes: 5 },
];

const mockProfile = {
  name: "Fiqri Ridho F",
  nim: "202410370110167",
  major: "Teknik Informatika",
  avatar: "https://krs.umm.ac.id/Poto/2024/202410370110167.JPG",
  history: [
    { id: "101", title: "Pintu Toilet Rusak", location: "Gedung B Lt. 2", status: "Diproses", date: "15 Sep 2026" },
    { id: "102", title: "Lampu SV Mati", location: "Parkiran Timur", status: "Selesai", date: "02 Sep 2026" },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');

  // HomeScreen Component
  const renderHome = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Halo, Selamat Datang 👋</Text>
          <Text style={styles.brandTitle}>KampusCare</Text>
        </View>
        <Image source={{ uri: mockProfile.avatar }} style={styles.headerAvatar} />
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
          <View key={item.id} style={styles.classroomCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.roomName}>{item.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'kosong' ? '#DCFCE7' : '#FEE2E2' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: item.status === 'kosong' ? '#166534' : '#991B1B' },
                  ]}
                >
                  {item.status === 'kosong' ? 'Kosong' : 'Digunakan'}
                </Text>
              </View>
            </View>
            <Text style={styles.roomBuilding}>{item.building}</Text>
            <Text style={styles.roomCapacity}>Kapasitas: {item.capacity} Kursi</Text>
          </View>
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
        <View key={report.id} style={styles.reportCard}>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportLocation}>📍 {report.location}</Text>
            <Text style={styles.reportDate}>📅 {report.date}</Text>
          </View>
          <View style={styles.reportBadgeContainer}>
            <View
              style={[
                styles.reportStatusBadge,
                report.status === 'Selesai'
                  ? styles.badgeSuccess
                  : report.status === 'Diproses'
                  ? styles.badgeWarning
                  : styles.badgeDanger,
              ]}
            >
              <Text style={styles.reportStatusText}>{report.status}</Text>
            </View>
            <Text style={styles.voteText}>👍 {report.votes}</Text>
          </View>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // CameraScreen Component (Shortcut Pelaporan)
  const renderCamera = () => (
    <View style={styles.cameraScreenContainer}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraIcon}>📸</Text>
        <Text style={styles.cameraTitle}>Shortcut Laporan Kerusakan</Text>
        <Text style={styles.cameraSubtitle}>
          Arahkan kamera ke fasilitas yang rusak untuk membuat laporan secara cepat.
        </Text>
        <TouchableOpacity style={styles.captureButton} activeOpacity={0.8}>
          <Text style={styles.captureButtonText}>Ambil Foto & Buat Laporan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ProfileScreen Component
  const renderProfile = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeaderCard}>
        <Image source={{ uri: mockProfile.avatar }} style={styles.profileAvatarLarge} />
        <Text style={styles.profileName}>{mockProfile.name}</Text>
        <Text style={styles.profileNim}>NIM: {mockProfile.nim}</Text>
        <Text style={styles.profileMajor}>{mockProfile.major}</Text>
      </View>

      <Text style={styles.sectionTitle}>Riwayat Pelaporan Saya</Text>
      {mockProfile.history.map((item) => (
        <View key={item.id} style={styles.historyCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <Text style={styles.historyLocation}>📍 {item.location}</Text>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
          <View
            style={[
              styles.reportStatusBadge,
              item.status === 'Selesai' ? styles.badgeSuccess : styles.badgeWarning,
            ]}
          >
            <Text style={styles.reportStatusText}>{item.status}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Keluar / Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Dynamic Screen View */}
      {activeTab === 'Home' && renderHome()}
      {activeTab === 'Camera' && renderCamera()}
      {activeTab === 'Profile' && renderProfile()}

      {/* Modern Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Home')}
        >
          <Text style={[styles.navIcon, activeTab === 'Home' && styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'Home' && styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemCamera}
          onPress={() => setActiveTab('Camera')}
          activeOpacity={0.85}
        >
          <View style={styles.cameraNavCircle}>
            <Text style={styles.cameraNavIcon}>📷</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Camera' && styles.activeNavLabel, { marginTop: 4 }]}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={[styles.navIcon, activeTab === 'Profile' && styles.activeNavIcon]}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'Profile' && styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  classroomCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 180,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roomBuilding: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  roomCapacity: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reportBadgeContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  reportStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  voteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
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
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileAvatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileNim: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  profileMajor: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  historyLocation: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemCamera: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    top: -14,
  },
  cameraNavCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cameraNavIcon: {
    fontSize: 24,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  activeNavIcon: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});
