import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
