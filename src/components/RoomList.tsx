import React from "react";
import { ScrollView, Text, View } from "react-native";

import { rooms, RoomStatus } from "../data/rooms";

const STATUS_CONFIG: Record<
  RoomStatus,
  {
    label: string;
    background: string;
    text: string;
  }
> = {
  empty: {
    label: "Kosong",
    background: "#DCFCE7",
    text: "#15803D",
  },

  occupied: {
    label: "Terpakai",
    background: "#FEE2E2",
    text: "#B91C1C",
  },

  upcoming: {
    label: "Akan Datang",
    background: "#FEF3C7",
    text: "#B45309",
  },

  maintenance: {
    label: "Perbaikan",
    background: "#E5E7EB",
    text: "#4B5563",
  },
};

export const ubahStatus = (status: RoomStatus): string => {
  return STATUS_CONFIG[status].label;
};

export const RoomList = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 12,
      }}
    >
      {rooms.map((room) => {
        const status = STATUS_CONFIG[room.status];

        return (
          <View
            key={room.id}
            style={{
              width: 280,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1E293B",
                }}
              >
                {room.name}
              </Text>

              <View
                style={{
                  backgroundColor: status.background,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: status.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {status.label}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: "#64748B",
                marginBottom: 6,
              }}
            >
              Gedung: {room.building}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#64748B",
              }}
            >
              Kapasitas: {room.capacity} orang
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

