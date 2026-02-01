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
  shortCode: string;
  
  // Pet Basic Info (from pet_data JSON)
  petName: string;
  petType: string;
  photoUrl: string;
  features: string;       // Renk/Özellik
  
  // Pet Specific Details (from pet_data JSON structure)
  sizeInfo?: string;      // Boy/Kilo
  temperament?: string;   // Huy (Uysal, Hırçın vb.)
  healthWarning?: string; // Sağlık Uyarısı
  vetInfo?: string;       // Veteriner Bilgisi
  microchipId?: string;   // Çip No (Hidden in JSON usually but admin sees it)

  // Lost Status (from lost_status JSON)
  lostDate: string;
  lostMessage: string;
  reward?: string;        // Para Ödülü (If available)
  location?: { lat: number; lng: number };

  // Primary Contact (from Find_Users columns)
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  city?: string;
  district?: string;
  contactPreference?: string;

  // Secondary/Emergency Contact (from Find_Users columns)
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  secondaryContactEmail?: string;
}

export type ViewState = 'dashboard' | 'settings' | 'search' | 'records' | 'lost-pets';

export interface User {
  username: string;
  isAuthenticated: boolean;
}