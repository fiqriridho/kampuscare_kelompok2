// services/locationService.ts

import { getJson } from "./api";
import type { Location } from "../types/location";

function isLocation(value: unknown): value is Location {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.name === "string" &&
    typeof item.latitude === "string" &&
    typeof item.longitude === "string"
  );
}

export const locationService = {
  async getLocations(): Promise<Location[]> {
    const raw = await getJson<unknown>("/locations");

    if (!Array.isArray(raw)) {
      throw new Error("Format response API tidak valid");
    }

    return raw.map((item): Location => {
      if (!isLocation(item)) {
        throw new Error("Struktur data lokasi tidak sesuai");
      }
      return {
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
      };
    });
  },
};