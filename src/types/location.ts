// types/location.ts
// Interface untuk response API https://api.nthusa.tw/locations

export interface Location {
  name: string;
  latitude: string;
  longitude: string;
}

export interface LocationApiResponse {
  success: boolean;
  data: Location[];
  message?: string;
  timestamp: string;
}