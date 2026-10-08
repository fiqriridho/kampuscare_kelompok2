import { ScrollView, Text, View } from "react-native";
import { rooms, RoomStatus } from "../data/room";

export const ubahStatus = (status: RoomStatus): string => {
  switch (status) {
    case "empty":
      return "kosong";
    case "occupied":
      return "terisi";
    case "upcoming":
      return "segera dipakai";
    case "maintenance":
      return "perbaikan";
    default:
      return "tidak diketahui";
  }
};

export const RoomList = () => {
  return (
    <ScrollView>
      <Text>Daftar Ruangan</Text>

      {rooms.map((room) => (
        <View key={room.id}>
          <Text>{room.name}</Text>
          <Text>Gedung: {room.building}</Text>
          <Text>Kapasitas: {room.capacity} orang</Text>
          <Text>Status: {ubahStatus(room.status)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};
