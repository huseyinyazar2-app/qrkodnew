import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Trash2 } from 'lucide-react';
import { QRRecord } from '../types';

interface QRTableProps {
  records: QRRecord[];
  onDelete: (id: string) => void;
}

export const QRTable: React.FC<QRTableProps> = ({ records, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-4">Önizleme</th>
              <th className="px-6 py-4">Kod ID</th>
              <th className="px-6 py-4">Şifre (PIN)</th>
              <th className="px-6 py-4">Hedef Link</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((record) => (
              <tr key={record.id} className={`hover:bg-gray-50 transition-colors ${record.unsaved ? 'bg-amber-50 hover:bg-amber-100' : ''}`}>
                <td className="px-6 py-3">
                  <div className="bg-white p-1 border rounded w-12 h-12 flex items-center justify-center">
                    <QRCodeCanvas value={record.fullUrl} size={40} />
                  </div>
                </td>
                <td className="px-6 py-3 font-mono font-bold text-gray-800">
                  {record.shortCode}
                </td>
                <td className="px-6 py-3 font-mono text-brand-600 font-bold">
                  {record.pin}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">
                  {record.fullUrl}
                </td>
                <td className="px-6 py-3">
                  {record.unsaved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
                      KAYDEDİLMEDİ
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status === 'active' ? 'BOŞ' : 'DOLU'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Kayıt bulunamadı.
        </div>
      )}
    </div>
  );
};