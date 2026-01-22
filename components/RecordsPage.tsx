import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Calendar
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { QRRecord } from '../types';
import { dbService } from '../services/dbService';

interface RecordsPageProps {
  records: QRRecord[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

type SortField = 'shortCode' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

export const RecordsPage: React.FC<RecordsPageProps> = ({ records, onDelete, onRefresh }) => {
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all');
  
  // Sorting States
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Edit PIN States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPinValue, setEditPinValue] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  // --- Helpers ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc'); // Default new sort to asc
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-brand-600" /> 
      : <ArrowDown className="w-4 h-4 text-brand-600" />;
  };

  const startEditing = (record: QRRecord) => {
    setEditingId(record.id);
    setEditPinValue(record.pin);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPinValue('');
  };

  const savePin = async (id: string) => {
    if (!editPinValue || editPinValue.length < 4) {
      alert("PIN en az 4 karakter olmalıdır.");
      return;
    }
    
    setIsSavingPin(true);
    const success = await dbService.updatePin(id, editPinValue);
    setIsSavingPin(false);

    if (success) {
      onRefresh(); // Reload data from parent
      setEditingId(null);
    } else {
      alert("PIN güncellenemedi.");
    }
  };

  // --- Processing Data (Filter & Sort) ---
  const processedRecords = useMemo(() => {
    let result = [...records];

    // 1. Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.shortCode.toLowerCase().includes(lowerTerm) ||
        r.fullUrl.toLowerCase().includes(lowerTerm)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // 2. Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle status string comparison specifically if needed, but string compare works fine
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, searchTerm, statusFilter, sortField, sortDirection]);

  // Exclude unsaved drafts from this list (this page is for DB records)
  const savedRecords = processedRecords.filter(r => !r.unsaved);

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Kod veya URL ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-brand-200 outline-none appearance-none cursor-pointer"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Boş (Aktif)</option>
              <option value="passive">Dolu (Pasif)</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500 font-medium">
          Toplam: <span className="text-brand-700">{savedRecords.length}</span> Kayıt
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4 w-20">QR</th>
                
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                  onClick={() => handleSort('shortCode')}
                >
                  <div className="flex items-center gap-2">
                    Kod
                    {getSortIcon('shortCode')}
                  </div>
                </th>

                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                  onClick={() => handleSort('createdAt')}
                >
                   <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-50" />
                    Tarih
                    {getSortIcon('createdAt')}
                  </div>
                </th>

                <th className="px-6 py-4">Şifre (PIN)</th>
                
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Durum
                    {getSortIcon('status')}
                  </div>
                </th>
                
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {savedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="w-10 h-10 bg-white border rounded flex items-center justify-center">
                       <QRCodeCanvas value={record.fullUrl} size={32} />
                    </div>
                  </td>
                  
                  <td className="px-6 py-3 font-mono font-bold text-gray-800">
                    {record.shortCode}
                  </td>

                  <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleString('tr-TR')}
                  </td>

                  <td className="px-6 py-3">
                    {editingId === record.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={editPinValue}
                          onChange={(e) => setEditPinValue(e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-brand-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                          maxLength={8}
                        />
                        <button 
                          onClick={() => savePin(record.id)}
                          disabled={isSavingPin}
                          className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/pin">
                        <span className="font-mono text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded">
                          {record.pin}
                        </span>
                        <button 
                          onClick={() => startEditing(record)}
                          className="opacity-0 group-hover/pin:opacity-100 text-gray-400 hover:text-brand-600 transition-opacity"
                          title="PIN Değiştir"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      record.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {record.status === 'active' ? 'BOŞ' : 'DOLU'}
                    </span>
                  </td>

                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => onDelete(record.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Kaydı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {savedRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center">
                       <Filter className="w-10 h-10 text-gray-300 mb-2" />
                       <p>Kriterlere uygun kayıt bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};