import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { LostPetRecord } from '../types';
import { AlertCircle, Phone, Calendar, Search, MapPin, X, Eye } from 'lucide-react';

export const LostPetsPage: React.FC = () => {
  const [lostPets, setLostPets] = useState<LostPetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<LostPetRecord | null>(null);

  useEffect(() => {
    loadLostPets();
  }, []);

  const loadLostPets = async () => {
    setLoading(true);
    const data = await dbService.getLostPets();
    setLostPets(data);
    setLoading(false);
  };

  const filteredPets = lostPets.filter(pet => 
    pet.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
       
       {/* Info Banner */}
       <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
         <AlertCircle className="w-6 h-6 flex-shrink-0" />
         <div>
           <h3 className="font-bold">Aktif Kayıp İlanları</h3>
           <p className="text-sm text-red-600">
             Şu an "Kayıp Modu" açık olan evcil hayvanlar listelenmektedir.
           </p>
         </div>
       </div>

       {/* Search Bar */}
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Hayvan adı, Sahip adı veya Kod ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none"
          />
       </div>

       {/* Table View */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4">Fotoğraf</th>
                <th className="px-6 py-4">İsim & Kod</th>
                <th className="px-6 py-4">Tür</th>
                <th className="px-6 py-4">Sahip</th>
                <th className="px-6 py-4">Kayıp Tarihi</th>
                <th className="px-6 py-4 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt={pet.petName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Yok</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div>
                      <div className="font-bold text-gray-900">{pet.petName}</div>
                      <div className="text-xs text-gray-500 font-mono">{pet.shortCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {pet.petType}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {pet.ownerName}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(pet.lostDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => setSelectedPet(pet)}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition"
                    >
                      <Eye className="w-4 h-4" /> İncele
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredPets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
       </div>

       {/* Modal for Details */}
       {selectedPet && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
             
             {/* Header */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Kayıp İlanı Detayı</h2>
                 <p className="text-sm text-gray-500 font-mono mt-1">ID: {selectedPet.shortCode}</p>
               </div>
               <button 
                 onClick={() => setSelectedPet(null)}
                 className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Content */}
             <div className="p-6 space-y-6">
               
               {/* Alert Box */}
               <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                 <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> Sahibinin Mesajı
                 </h4>
                 <p className="text-red-900 italic">
                   "{selectedPet.lostMessage}"
                 </p>
               </div>

               <div className="flex flex-col md:flex-row gap-6">
                 {/* Left: Photo */}
                 <div className="w-full md:w-1/3">
                   <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                     {selectedPet.photoUrl ? (
                       <img src={selectedPet.photoUrl} alt={selectedPet.petName} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">Fotoğraf Yok</div>
                     )}
                   </div>
                   <div className="mt-4 text-center">
                     <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                       {selectedPet.petType}
                     </span>
                   </div>
                 </div>

                 {/* Right: Info */}
                 <div className="flex-1 space-y-4">
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase">Hayvan Adı</label>
                     <div className="text-xl font-bold text-gray-900">{selectedPet.petName}</div>
                   </div>

                   {selectedPet.features && (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Özellikler / Renk</label>
                      <div className="text-gray-700">{selectedPet.features}</div>
                    </div>
                   )}

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-400 uppercase">Kayıp Tarihi</label>
                       <div className="text-gray-900 font-medium">{new Date(selectedPet.lostDate).toLocaleDateString('tr-TR')}</div>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-400 uppercase">Şehir / İlçe</label>
                       <div className="text-gray-900 font-medium">
                         {selectedPet.city || '-'} / {selectedPet.district || '-'}
                       </div>
                     </div>
                   </div>

                   <div className="pt-4 border-t border-gray-100">
                     <h4 className="font-bold text-gray-900 mb-3">İletişim Bilgileri</h4>
                     <div className="space-y-2">
                       <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                         <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                           <div className="font-bold">{selectedPet.ownerName.charAt(0)}</div>
                         </div>
                         <div>
                           <div className="text-xs text-gray-500">Ad Soyad</div>
                           <div className="font-medium text-gray-900">{selectedPet.ownerName}</div>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-green-50 transition">
                         <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                           <Phone className="w-4 h-4" />
                         </div>
                         <div>
                           <div className="text-xs text-gray-500">Telefon</div>
                           <div className="font-medium text-gray-900">{selectedPet.ownerPhone}</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

             </div>

           </div>
         </div>
       )}
    </div>
  );
};