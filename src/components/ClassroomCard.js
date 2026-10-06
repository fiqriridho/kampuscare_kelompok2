import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ClassroomCard({ item }) {
  const isAvailable = item.status === 'kosong';

  return (
    <View style={styles.classroomCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.roomName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isAvailable ? '#DCFCE7' : '#FEE2E2' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isAvailable ? '#166534' : '#991B1B' },
            ]}
          >
            {isAvailable ? 'Kosong' : 'Digunakan'}
          </Text>
        </View>
      </View>
      <Text style={styles.roomBuilding}>{item.building}</Text>
      <Text style={styles.roomCapacity}>Kapasitas: {item.capacity} Kursi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
