import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { LostPetRecord } from '../types';
import { AlertCircle, Phone, MapPin, Calendar, ExternalLink } from 'lucide-react';

export const LostPetsPage: React.FC = () => {
  const [lostPets, setLostPets] = useState<LostPetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLostPets();
  }, []);

  const loadLostPets = async () => {
    setLoading(true);
    const data = await dbService.getLostPets();
    setLostPets(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
         <AlertCircle className="w-6 h-6 flex-shrink-0" />
         <div>
           <h3 className="font-bold">Aktif Kayıp İlanları</h3>
           <p className="text-sm text-red-600">
             Aşağıdaki listede şu an "Kayıp Modu" açık olan evcil hayvanlar listelenmektedir.
           </p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {lostPets.map(pet => (
           <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
             {/* Image Section */}
             <div className="sm:w-48 h-48 sm:h-auto bg-gray-100 relative">
               {pet.photoUrl ? (
                 <img src={pet.photoUrl} alt={pet.petName} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Fotoğraf Yok</div>
               )}
               <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-pulse">
                 KAYIP
               </div>
             </div>

             {/* Content Section */}
             <div className="p-5 flex-1 flex flex-col justify-between">
               <div>
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className="text-xl font-bold text-gray-900">{pet.petName}</h4>
                     <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{pet.petType}</span>
                   </div>
                   <div className="text-right">
                     <span className="block text-xs text-gray-400 font-mono">ID: {pet.shortCode}</span>
                   </div>
                 </div>

                 {pet.lostMessage && (
                   <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-sm text-amber-900 italic mb-4">
                     "{pet.lostMessage}"
                   </div>
                 )}

                 <div className="space-y-2 text-sm">
                   <div className="flex items-center gap-2 text-gray-600">
                     <Calendar className="w-4 h-4 text-gray-400" />
                     <span>Kayıp Tarihi: <strong>{new Date(pet.lostDate).toLocaleDateString('tr-TR')}</strong></span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-600">
                     <UserIcon className="w-4 h-4 text-gray-400" />
                     <span>Sahibi: <strong>{pet.ownerName}</strong></span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-600">
                     <Phone className="w-4 h-4 text-gray-400" />
                     <span>İletişim: <strong>{pet.ownerPhone}</strong></span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>

       {lostPets.length === 0 && (
         <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
           <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
             <AlertCircle className="w-8 h-8 text-green-400" />
           </div>
           <h3 className="text-lg font-medium text-gray-900">Kayıp İlanı Yok</h3>
           <p className="text-gray-500 mt-1">Şu anda sistemde aktif bir kayıp alarmı bulunmuyor.</p>
         </div>
       )}
    </div>
  );
};

// Helper Icon
function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}