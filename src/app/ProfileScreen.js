import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

export default function ProfileScreen({
  userProfile,
  reportHistory = [],
  handleLogout,
}) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <Image
          source={{ uri: userProfile?.avatar || 'https://krs.umm.ac.id/Poto/2024/202410370110167.JPG' }}
          style={styles.profileAvatarLarge}
        />
        <Text style={styles.profileName}>{userProfile?.name || 'Mahasiswa'}</Text>
        <Text style={styles.profileNim}>NIM: {userProfile?.nim || '-'}</Text>
        <Text style={styles.profileMajor}>{userProfile?.major || '-'}</Text>
        {userProfile?.email && (
          <Text style={styles.profileEmail}>✉️ {userProfile.email}</Text>
        )}

        {/* Status Penyimpanan Profile & Session */}
        <View style={styles.badgeProfileStorage}>
          <Text style={styles.badgeProfileStorageText}>
            ✓ Profil tersimpan di AsyncStorage (Non-Sensitif)
          </Text>
        </View>
        <View style={styles.badgeSessionStorage}>
          <Text style={styles.badgeSessionStorageText}>
            {Platform.OS !== 'web'
              ? '🔒 Sesi aktif terverifikasi dari Expo SecureStore'
              : '💻 Sesi aktif terverifikasi (In-Memory Web Demo)'}
          </Text>
        </View>
      </View>

      {/* Riwayat Pelaporan Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Riwayat Pelaporan Saya</Text>
        <Text style={styles.badgeCounterText}>{reportHistory.length} Laporan</Text>
      </View>

      {/* List Riwayat Pelaporan / Empty State */}
      {reportHistory.length === 0 ? (
        <View style={styles.emptyHistoryCard}>
          <Text style={styles.emptyHistoryIcon}>📝</Text>
          <Text style={styles.emptyHistoryText}>Belum ada riwayat laporan kerusakan.</Text>
          <Text style={styles.emptyHistorySubtext}>
            Gunakan tab Camera untuk membuat laporan pertama Anda.
          </Text>
        </View>
      ) : (
        reportHistory.map((item) => (
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
        ))
      )}

      {/* Tombol Logout: Menghapus token dari SecureStore */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>Keluar / Logout</Text>
      </TouchableOpacity>
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
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  badgeProfileStorage: {
    marginTop: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeProfileStorageText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  badgeSessionStorage: {
    marginTop: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeSessionStorageText: {
    fontSize: 11,
    color: '#3730A3',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  badgeCounterText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyHistoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyHistoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptyHistorySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
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
  },
  historyLocation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
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
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
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
});
