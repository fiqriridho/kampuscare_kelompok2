export type RoomStatus = "empty" | "occupied" | "upcoming" | "maintenance";

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  status: RoomStatus;
}

export const rooms: Room[] = [
  {
    id: "R308",
    name: "Ruang 308",
    building: "GKB 2",
    capacity: 50,
    status: "empty",
  },
  {
    id: "R401",
    name: "Ruang 401",
    building: "GKB 2",
    capacity: 50,
    status: "occupied",
  },
  {
    id: "R402",
    name: "Ruang 402",
    building: "GKB 2",
    capacity: 50,
    status: "upcoming",
  },
  {
    id: "R316",
    name: "Ruang 316",
    building: "GKB 3",
    capacity: 50,
    status: "maintenance",
  },
];
