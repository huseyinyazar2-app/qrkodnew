export interface QRRecord {
  id: string;          // The unique ID (UUID) for the record
  shortCode: string;   // The 6-char random alphanumeric code
  pin: string;         // The 6-digit password
  fullUrl: string;     // Base URL + shortCode
  status: 'active' | 'passive'; // Status of the code (active=boş, passive=dolu)
  createdAt: number;
  unsaved?: boolean;   // UI flag: true if generated but not yet saved to DB
  isJustSaved?: boolean; // UI flag: true if saved in the current session (allows batch PDF download)
  
  // Owner Info (Populated if status is passive/dolu)
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface LostPetRecord {
  id: string;
  petName: string;
  petType: string;
  photoUrl: string;
  lostDate: string;
  lostMessage: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  shortCode: string;
  // Extra details for modal
  features?: string;
  city?: string;
  district?: string;
  location?: { lat: number; lng: number };
}

export type ViewState = 'dashboard' | 'settings' | 'search' | 'records' | 'lost-pets';

export interface User {
  username: string;
  isAuthenticated: boolean;
}