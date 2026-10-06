import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { mapRoomStatus } from '../hooks/useRooms';

export default function ClassroomCard({ item }) {
  const statusInfo = mapRoomStatus(item.status);

  return (
    <View style={styles.classroomCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.roomName} numberOfLines={1}>
          {item.name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.bgColor },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusInfo.textColor },
            ]}
          >
            {statusInfo.label}
          </Text>
        </View>
      </View>
      <Text style={styles.roomBuilding}>
        📍 {item.location || item.building || 'Gedung Kuliah'}
      </Text>
      <Text style={styles.roomCapacity}>
        Kapasitas: {item.capacity} Kursi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  classroomCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
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
