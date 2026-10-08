import React from 'react';
import { rooms } from '../data/room'; 
const ubahStatus = (status: "empty" | "occupied" | "upcoming" | "maintenance") => {
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

const RoomList = () => {
  return (
    <div>
      <h2>Daftar Ruangan</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <strong>{room.name}</strong> ({room.building}) - Kapasitas: {room.capacity}
            <br />
            Status: {ubahStatus(room.status)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;