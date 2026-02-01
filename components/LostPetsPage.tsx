import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { LostPetRecord } from '../types';
import { 
  AlertCircle, 
  Phone, 
  Search, 
  X, 
  Eye, 
  MapPin, 
  Mail, 
  Calendar, 
  Award,
  Info,
  User,
  Users,
  Hash,
  Stethoscope,
  Heart,
  Scale
} from 'lucide-react';

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

       {/* Enhanced Modal for Details */}
       {selectedPet && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 relative flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-20 rounded-t-2xl">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-2xl font-bold text-gray-900">Kayıp İlanı Detayı</h2>
                   {selectedPet.reward && (
                     <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                       <Award className="w-3 h-3" /> ÖDÜLLÜ: {selectedPet.reward}
                     </span>
                   )}
                 </div>
                 <p className="text-sm text-gray-500 font-mono flex items-center gap-2">
                   <Hash className="w-3 h-3" /> Kod ID: {selectedPet.shortCode}
                 </p>
               </div>
               <button 
                 onClick={() => setSelectedPet(null)}
                 className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Content Scrollable Area */}
             <div className="p-6 overflow-y-auto custom-scrollbar">
               
               {/* 1. Alert Message Section */}
               <div className="bg-red-50 border border-red-200 p-5 rounded-xl mb-6 shadow-sm">
                 <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> Sahibinin Kayıp Mesajı
                 </h4>
                 <p className="text-red-900 text-lg italic leading-relaxed">
                   "{selectedPet.lostMessage}"
                 </p>
               </div>

               <div className="flex flex-col lg:flex-row gap-8">
                 
                 {/* LEFT COLUMN: Photo & Key Stats */}
                 <div className="w-full lg:w-1/3 flex-shrink-0 space-y-4">
                   <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative">
                     {selectedPet.photoUrl ? (
                       <img src={selectedPet.photoUrl} alt={selectedPet.petName} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                         <Search className="w-8 h-8 opacity-20" />
                         <span>Fotoğraf Yok</span>
                       </div>
                     )}
                   </div>
                   
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500 text-sm">Tür</span>
                        <span className="font-bold text-gray-800">{selectedPet.petType}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500 text-sm flex items-center gap-1"><Scale className="w-3 h-3"/> Boy/Kilo</span>
                        <span className="font-bold text-gray-800">{selectedPet.sizeInfo || '-'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm flex items-center gap-1"><Heart className="w-3 h-3"/> Huy</span>
                        <span className="font-bold text-gray-800">{selectedPet.temperament || '-'}</span>
                     </div>
                   </div>
                   
                   {/* Health Warning if exists */}
                   {selectedPet.healthWarning && selectedPet.healthWarning !== 'Yok' && (
                     <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                        <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1 mb-1">
                          <Stethoscope className="w-3 h-3" /> Sağlık Uyarısı
                        </label>
                        <p className="text-sm text-amber-900">{selectedPet.healthWarning}</p>
                     </div>
                   )}
                 </div>

                 {/* RIGHT COLUMN: Detailed Info & Contact */}
                 <div className="flex-1 space-y-6">
                   
                   {/* Pet Identity */}
                   <div>
                     <div className="flex items-end gap-3 mb-4">
                       <h1 className="text-3xl font-extrabold text-gray-900 leading-none">{selectedPet.petName}</h1>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                            <Info className="w-3 h-3" /> Renk / Özellikler
                          </label>
                          <div className="text-gray-800 font-medium">
                            {selectedPet.features || 'Belirtilmemiş'}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                             <Hash className="w-3 h-3" /> Mikroçip No
                          </label>
                          <div className="text-gray-800 font-mono font-medium tracking-wide">
                            {selectedPet.microchipId || 'Yok / Gizli'}
                          </div>
                        </div>
                        
                        {selectedPet.vetInfo && (
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                              <Stethoscope className="w-3 h-3" /> Veteriner Bilgisi
                            </label>
                            <div className="text-gray-800 font-medium">
                              {selectedPet.vetInfo}
                            </div>
                          </div>
                        )}

                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                             <Calendar className="w-3 h-3" /> Kayıp Tarihi
                          </label>
                          <div className="text-red-600 font-bold">
                            {new Date(selectedPet.lostDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200 md:col-span-2">
                          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                             <MapPin className="w-3 h-3" /> Kaybolduğu Konum
                          </label>
                          <div className="text-gray-800 font-medium">
                            {selectedPet.city || '-'} / {selectedPet.district || '-'}
                          </div>
                        </div>
                     </div>
                   </div>

                   {/* Contact Section */}
                   <div className="border-t-2 border-dashed border-gray-200 pt-6">
                     <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                       <Users className="w-5 h-5 text-brand-600" /> İletişim Bilgileri
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Primary Contact */}
                       <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 bg-brand-200 text-brand-700 rounded-full flex items-center justify-center">
                             <User className="w-5 h-5" />
                           </div>
                           <div>
                             <div className="text-xs text-brand-600 font-bold uppercase">Sahibi (1. Kişi)</div>
                             <div className="font-bold text-gray-900 text-lg">{selectedPet.ownerName}</div>
                           </div>
                         </div>
                         <div className="space-y-2 pl-2">
                           <div className="flex items-center gap-2 text-gray-700">
                             <Phone className="w-4 h-4 text-brand-500" />
                             <span className="font-mono font-medium">{selectedPet.ownerPhone}</span>
                           </div>
                           {selectedPet.ownerEmail && (
                             <div className="flex items-center gap-2 text-gray-700">
                               <Mail className="w-4 h-4 text-brand-500" />
                               <span className="text-sm truncate">{selectedPet.ownerEmail}</span>
                             </div>
                           )}
                           {selectedPet.contactPreference && (
                             <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-brand-200">
                               Tercih: {selectedPet.contactPreference}
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Secondary Contact (Emergency Contact) */}
                       {(selectedPet.secondaryContactName || selectedPet.secondaryContactPhone) ? (
                         <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                           <div className="flex items-center gap-3 mb-3">
                             <div className="w-10 h-10 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center">
                               <User className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="text-xs text-orange-600 font-bold uppercase">Yedek İletişim (2. Kişi)</div>
                               <div className="font-bold text-gray-900 text-lg">{selectedPet.secondaryContactName || 'Belirtilmemiş'}</div>
                             </div>
                           </div>
                           <div className="space-y-2 pl-2">
                             {selectedPet.secondaryContactPhone && (
                               <div className="flex items-center gap-2 text-gray-700">
                                 <Phone className="w-4 h-4 text-orange-500" />
                                 <span className="font-mono font-medium">{selectedPet.secondaryContactPhone}</span>
                               </div>
                             )}
                             {selectedPet.secondaryContactEmail && (
                               <div className="flex items-center gap-2 text-gray-700">
                                 <Mail className="w-4 h-4 text-orange-500" />
                                 <span className="text-sm truncate">{selectedPet.secondaryContactEmail}</span>
                               </div>
                             )}
                           </div>
                         </div>
                       ) : (
                         <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                           <Users className="w-8 h-8 mb-2 opacity-50" />
                           <span className="text-sm font-medium">Yedek Kişi Bilgisi Yok</span>
                         </div>
                       )}
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