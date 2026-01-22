export interface QRRecord {
  id: string;          // The unique ID (UUID) for the record
  shortCode: string;   // The 6-char random alphanumeric code
  pin: string;         // The 6-digit password
  fullUrl: string;     // Base URL + shortCode
  status: 'active' | 'passive'; // Status of the code
  createdAt: number;
  unsaved?: boolean;   // UI flag: true if generated but not yet saved to DB
}

export type ViewState = 'dashboard' | 'settings' | 'search' | 'records';

export interface User {
  username: string;
  isAuthenticated: boolean;
}