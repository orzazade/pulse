export interface IDonationCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  latitude: number;
  longitude: number;
  hours?: string;
  createdAt: Date;
}

export interface ICity {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}
