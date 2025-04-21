
export type UserRole = 'donor' | 'ngo' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  address?: string;
  phone?: string;
  verified: boolean;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  foodName: string;
  quantity: string;
  description: string;
  expiryTime: Date;
  createdAt: Date;
  image?: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  status: 'pending' | 'accepted' | 'picked_up' | 'expired' | 'cancelled';
  acceptedBy?: {
    id: string;
    name: string;
  };
}
