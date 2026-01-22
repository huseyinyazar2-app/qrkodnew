import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Trash2, Key, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { QRRecord } from '../types';

interface QRCardProps {
  record: QRRecord;
  onDelete: (id: string) => void;
}

export const QRCard: React.FC<QRCardProps> = ({ record, onDelete }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRWithText = () => {
    const originalCanvas = qrRef.current?.querySelector('canvas');
    if (!originalCanvas) return;

    // Create a new canvas to combine QR + Text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Increase height to accommodate "Find Me" + Code ID
    const extraHeight = 70; 
    
    // Set dimensions
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height + extraHeight;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw original QR
    ctx.drawImage(originalCanvas, 0, 0);

    // Draw "Find Me" label
    ctx.font = 'bold 16px sans-serif'; 
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Find Me", canvas.width / 2, originalCanvas.height + 25);

    // Draw Code ID below "Find Me"
    ctx.font = 'bold 24px monospace'; 
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(record.shortCode, canvas.width / 2, originalCanvas.height + 55);

    // Download
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-${record.shortCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const isUnsaved = record.unsaved;

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition duration-300 flex flex-col ${
      isUnsaved ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200'
    }`}>
      <div className="p-6 flex flex-col items-center bg-gray-50 border-b border-gray-100 relative group">
        
        {/* Status Badge */}
        {isUnsaved ? (
           <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 flex items-center gap-1">
             <AlertTriangle className="w-3 h-3" /> KAYDEDİLMEDİ
           </div>
        ) : (
           <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
             record.status === 'active' 
               ? 'bg-green-100 text-green-700' 
               : 'bg-red-100 text-red-700'
           }`}>
             {record.status === 'active' ? 'BOŞ' : 'DOLU'}
           </div>
        )}

        <div ref={qrRef} className="bg-white p-2 rounded-lg shadow-sm flex flex-col items-center">
          <QRCodeCanvas
            value={record.fullUrl}
            size={180}
            level={"H"}
            includeMargin={true}
          />
        </div>
        
        {/* Visual Display on Card */}
        <div className="mt-3 flex flex-col items-center gap-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Find Me</span>
          <span className="font-mono text-xl font-bold text-gray-800 tracking-wider">
            {record.shortCode}
          </span>
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={downloadQRWithText}
             className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:text-brand-600 transition"
             title="Resmi İndir"
           >
             <Download className="w-4 h-4" />
           </button>
           <button 
             onClick={() => onDelete(record.id)}
             className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:text-red-600 transition"
             title="Sil"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-center justify-between bg-brand-50 p-3 rounded-lg border border-brand-100">
           <div className="flex items-center gap-2 text-sm text-brand-700">
              <Key className="w-4 h-4" />
              <span>Giriş Şifresi</span>
           </div>
           <span className="font-mono text-xl font-bold text-brand-700 tracking-widest">
             {record.pin}
           </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <LinkIcon className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{record.fullUrl}</span>
        </div>
      </div>
    </div>
  );
};