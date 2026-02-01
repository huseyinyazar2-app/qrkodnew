import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Trash2, Key, Link as LinkIcon, AlertTriangle, Check } from 'lucide-react';
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

    // Ask user for dimension
    const sizeCmStr = prompt("Çıktı için genişlik (cm) giriniz:", "3");
    if (!sizeCmStr) return;
    
    const sizeCm = parseFloat(sizeCmStr.replace(',', '.'));
    if (isNaN(sizeCm) || sizeCm <= 0) {
      alert("Geçersiz boyut.");
      return;
    }

    // High resolution (300 DPI)
    // 1 cm = 118.11 pixels at 300 DPI
    const pixels = Math.round(sizeCm * 118.11);
    
    // Create high-res canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = pixels * 0.05; // 5% padding
    canvas.width = pixels;
    // Extra height for text: roughly 30% of height
    const extraHeight = pixels * 0.35; 
    canvas.height = pixels + extraHeight;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR Code
    // We cannot just draw the original canvas because it might be low res.
    // However, for this client-side impl, we scale the image. 
    // Ideally we would redraw QR at high res, but scaling 'H' level QR usually works fine for this scale.
    // Better quality: disable image smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(originalCanvas, padding, padding, pixels - (padding*2), pixels - (padding*2));

    // Text Settings
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';

    // 1. "Find Me" Label
    const fontSize1 = Math.round(pixels * 0.1); 
    ctx.font = `bold ${fontSize1}px sans-serif`;
    ctx.fillText("Find Me", canvas.width / 2, pixels + (extraHeight * 0.25));

    // 2. Short Code
    const fontSize2 = Math.round(pixels * 0.15);
    ctx.font = `bold ${fontSize2}px monospace`;
    ctx.fillText(record.shortCode, canvas.width / 2, pixels + (extraHeight * 0.55));

    // 3. PIN Code
    const fontSize3 = Math.round(pixels * 0.08);
    ctx.fillStyle = '#555555'; // Dark gray for PIN
    ctx.font = `bold ${fontSize3}px monospace`;
    ctx.fillText(`PIN: ${record.pin}`, canvas.width / 2, pixels + (extraHeight * 0.85));

    // Download
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-${record.shortCode}-${sizeCm}cm.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const isUnsaved = record.unsaved;
  const isJustSaved = record.isJustSaved;

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition duration-300 flex flex-col ${
      isUnsaved 
        ? 'border-amber-400 ring-2 ring-amber-100' 
        : isJustSaved 
          ? 'border-green-400 ring-2 ring-green-100'
          : 'border-gray-200'
    }`}>
      <div className="p-6 flex flex-col items-center bg-gray-50 border-b border-gray-100 relative group">
        
        {/* Status Badge */}
        {isUnsaved && (
           <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 flex items-center gap-1">
             <AlertTriangle className="w-3 h-3" /> TASLAK
           </div>
        )}
        
        {isJustSaved && (
           <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 flex items-center gap-1">
             <Check className="w-3 h-3" /> KAYDEDİLDİ
           </div>
        )}

        {!isUnsaved && !isJustSaved && (
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
             title="Resmi İndir (CM Ayarlı)"
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