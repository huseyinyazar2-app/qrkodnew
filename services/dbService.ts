import { QRRecord, LostPetRecord } from '../types';
import { supabase } from './supabaseClient';

// Helper to generate 6-char alphanumeric code
const generateShortCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to generate 6-digit PIN
const generatePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const dbService = {
  // --- AUTHENTICATION ---
  login: async (username: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('QR_admin')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return false;
    }
    return true;
  },

  // --- RECORDS ---
  getRecords: async (): Promise<QRRecord[]> => {
    // Modified query to be safer. using explicit left join logic via select syntax if possible.
    // Ensure we handle cases where Find_Users is missing.
    const { data, error } = await supabase
      .from('QR_Kod')
      .select(`
        *,
        Find_Users (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching records:', error);
      return [];
    }

    if (!data) return [];

    return data.map((item: any) => {
      // Find_Users might be null, an array, or an object. Safe parsing.
      let user = null;
      if (item.Find_Users) {
        user = Array.isArray(item.Find_Users) ? item.Find_Users[0] : item.Find_Users;
      }

      return {
        id: item.id,
        shortCode: item.short_code,
        pin: item.pin,
        fullUrl: item.full_url,
        status: item.status === 'boş' ? 'active' : 'passive',
        createdAt: new Date(item.created_at).getTime(),
        ownerName: user?.full_name || '-',
        ownerEmail: user?.email || '-',
        ownerPhone: user?.phone || '-'
      };
    });
  },

  // --- LOST PETS ---
  getLostPets: async (): Promise<LostPetRecord[]> => {
    // Fetch pets where lost_status -> isActive is true
    const { data, error } = await supabase
      .from('Find_Pets')
      .select(`
        id,
        pet_data,
        lost_status,
        Find_Users (
          full_name,
          phone,
          email,
          qr_code,
          city,
          district
        )
      `)
      .contains('lost_status', { isActive: true });

    if (error) {
      console.error('Error fetching lost pets:', error);
      return [];
    }

    return data.map((item: any) => {
      const user = Array.isArray(item.Find_Users) ? item.Find_Users[0] : item.Find_Users;
      const petData = item.pet_data || {};
      const lostStatus = item.lost_status || {};
      
      const getVal = (field: any) => (typeof field === 'object' && field?.value ? field.value : field);

      return {
        id: item.id,
        petName: getVal(petData.name) || 'Bilinmiyor',
        petType: petData.type || 'Bilinmiyor',
        photoUrl: getVal(petData.photoUrl) || '',
        features: getVal(petData.features) || '',
        lostDate: lostStatus.lostDate || '',
        lostMessage: lostStatus.message || '',
        location: lostStatus.lastSeenLocation || null,
        ownerName: user?.full_name || 'Gizli',
        ownerPhone: user?.phone || 'Gizli',
        ownerEmail: user?.email || 'Gizli',
        city: user?.city || '',
        district: user?.district || '',
        shortCode: user?.qr_code || '-'
      };
    });
  },

  generateBatch: (baseUrl: string, count: number): QRRecord[] => {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const newRecords: QRRecord[] = [];

    for (let i = 0; i < count; i++) {
      const shortCode = generateShortCode();
      const record: QRRecord = {
        id: crypto.randomUUID(),
        shortCode,
        pin: generatePin(),
        fullUrl: `${cleanBaseUrl}${shortCode}`,
        status: 'active',
        createdAt: Date.now(),
        unsaved: true
      };
      newRecords.push(record);
    }
    return newRecords;
  },

  saveBatch: async (recordsToSave: QRRecord[]): Promise<{ saved: number; skipped: number }> => {
    if (recordsToSave.length === 0) return { saved: 0, skipped: 0 };

    // Check duplicates
    const codesToCheck = recordsToSave.map(r => r.shortCode);
    const { data: existingData, error: checkError } = await supabase
      .from('QR_Kod')
      .select('short_code')
      .in('short_code', codesToCheck);

    if (checkError) throw checkError;

    const existingCodes = new Set(existingData?.map((item: any) => item.short_code));
    const uniqueRecords = recordsToSave.filter(r => !existingCodes.has(r.shortCode));
    const skippedCount = recordsToSave.length - uniqueRecords.length;

    if (uniqueRecords.length === 0) {
      return { saved: 0, skipped: skippedCount };
    }

    // Insert
    const insertPayload = uniqueRecords.map(r => ({
      short_code: r.shortCode,
      pin: r.pin,
      full_url: r.fullUrl,
      status: r.status === 'active' ? 'boş' : 'dolu',
    }));

    const { error: insertError } = await supabase
      .from('QR_Kod')
      .insert(insertPayload);

    if (insertError) throw insertError;

    return { saved: uniqueRecords.length, skipped: skippedCount };
  },

  updatePin: async (id: string, newPin: string): Promise<boolean> => {
    const { error } = await supabase
      .from('QR_Kod')
      .update({ pin: newPin })
      .eq('id', id);

    if (error) {
      console.error('Error updating PIN:', error);
      return false;
    }
    return true;
  },

  deleteRecord: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('QR_Kod')
      .delete()
      .eq('id', id);
      
    if (error) console.error('Error deleting record:', error);
  },

  // --- SETTINGS (Moved to Supabase) ---
  getBaseUrl: async (): Promise<string> => {
    const { data, error } = await supabase
      .from('QR_Settings')
      .select('value')
      .eq('key', 'base_url')
      .single();

    if (error || !data) return '';
    return data.value;
  },

  saveBaseUrl: async (url: string): Promise<void> => {
    // Upsert: Insert or Update if key exists
    const { error } = await supabase
      .from('QR_Settings')
      .upsert({ key: 'base_url', value: url });

    if (error) console.error('Error saving base url:', error);
  }
};