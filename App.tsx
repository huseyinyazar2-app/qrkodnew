import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  AlertCircle,
  Save,
  Search,
  List,
  Grid,
  Zap,
  CheckCircle,
  ScanLine,
  Database
} from 'lucide-react';

import { Login } from './components/Login';
import { QRCard } from './components/QRCard';
import { QRTable } from './components/QRTable';
import { RecordsPage } from './components/RecordsPage'; // New Import
import { dbService } from './services/dbService';
import { QRRecord, ViewState } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>('dashboard');
  
  // records contains BOTH saved and unsaved (draft) records
  const [records, setRecords] = useState<QRRecord[]>([]);
  
  const [baseUrl, setBaseUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempBaseUrl, setTempBaseUrl] = useState('');
  
  // States for Code Search Page
  const [searchCodeInput, setSearchCodeInput] = useState('');
  const [foundRecord, setFoundRecord] = useState<QRRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [generateCount, setGenerateCount] = useState<number>(1);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadData = async () => {
    // Load Records
    const data = await dbService.getRecords();
    setRecords(data);
    
    // Load Settings from DB (Async now)
    const url = await dbService.getBaseUrl();
    setBaseUrl(url);
    setTempBaseUrl(url);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('dashboard');
    setRecords([]);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    await dbService.saveBaseUrl(tempBaseUrl);
    setBaseUrl(tempBaseUrl);
    setIsSavingSettings(false);
    setView('dashboard');
  };

  // STEP 1: Generate Drafts (Does NOT save to DB yet)
  const handleGenerateDrafts = () => {
    if (!baseUrl) {
      setView('settings');
      alert("Lütfen önce Kök URL ayarını yapınız.");
      return;
    }

    if (generateCount < 1) {
      alert("Lütfen geçerli bir adet giriniz.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      // Create records in memory only
      const drafts = dbService.generateBatch(baseUrl, generateCount);
      // Add them to the TOP of the list
      setRecords(prev => [...drafts, ...prev]);
      setIsGenerating(false);
    }, 400);
  };

  // STEP 2: Save Unsaved Records to DB (with Duplicate Check)
  const handleSaveChanges = async () => {
    const unsavedRecords = records.filter(r => r.unsaved);
    if (unsavedRecords.length === 0) return;

    if (!window.confirm(`${unsavedRecords.length} adet taslak kayıt veritabanına işlenecek. Onaylıyor musunuz?`)) {
      return;
    }

    setIsSaving(true);
    
    // Perform async save
    try {
      const result = await dbService.saveBatch(unsavedRecords);
      
      // Reload data from DB to ensure UI matches exactly what is stored.
      await loadData();
      
      // Reset count
      setGenerateCount(1);

      // Feedback to user
      if (result.skipped > 0) {
        alert(
          `İşlem Tamamlandı:\n` +
          `✅ ${result.saved} adet başarıyla kaydedildi.\n` +
          `⚠️ ${result.skipped} adet çakışan kod tespit edildi ve iptal edildi.`
        );
      }
    } catch (error) {
      alert("Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const recordToDelete = records.find(r => r.id === id);
    if (!recordToDelete) return;

    if (window.confirm('Bu QR kodunu silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.')) {
      // If it's saved in DB, delete from DB
      if (!recordToDelete.unsaved) {
        await dbService.deleteRecord(id);
      }
      // Always remove from UI state (Optimistic update for Dashboard)
      setRecords(records.filter(r => r.id !== id));
      
      // If we deleted the found record in search view, clear it
      if (view === 'search' && foundRecord?.id === id) {
        setFoundRecord(null);
        setHasSearched(false);
      }
      
      // If we are on records page, re-fetch ensures consistency
      if (view === 'records') {
        loadData();
      }
    }
  };

  // Logic for the Search Page
  const handleSearchSingleCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCodeInput.trim()) return;

    const found = records.find(r => r.shortCode === searchCodeInput.trim());
    setFoundRecord(found || null);
    setHasSearched(true);
  };

  const filteredRecords = records.filter(r => 
    r.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.fullUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unsavedCount = records.filter(r => r.unsaved).length;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">QR Admin Pro</h1>
          <p className="text-slate-400 text-xs mt-1">v1.6.0 Extended</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'dashboard' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Panel (Üretim)
          </button>

          {/* New Menu Item */}
          <button
            onClick={() => setView('records')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'records' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database className="w-5 h-5" />
            Tüm Kayıtlar
          </button>
          
          <button
            onClick={() => {
              setView('search');
              setFoundRecord(null);
              setSearchCodeInput('');
              setHasSearched(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'search' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ScanLine className="w-5 h-5" />
            Kod Sorgula
          </button>

          <button
            onClick={() => setView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'settings' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Ayarlar (URL)
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex flex-col xl:flex-row justify-between items-center gap-4 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800 self-start xl:self-center">
            {view === 'dashboard' && 'QR Üretim Paneli'}
            {view === 'records' && 'Tüm Kayıt Listesi'}
            {view === 'settings' && 'Sistem Ayarları'}
            {view === 'search' && 'Kod Sorgulama'}
          </h2>
          
          {view === 'dashboard' && (
             <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
               {!baseUrl && (
                 <span className="flex items-center gap-1 text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                   <AlertCircle className="w-4 h-4" /> URL Ayarlanmadı
                 </span>
               )}
               
               {/* Controls */}
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 
                 {/* Generate Section */}
                 <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                   <span className="text-xs font-semibold text-gray-500 pl-2 uppercase">Adet:</span>
                   <input 
                      type="number" 
                      min="1" 
                      max="100"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                   />
                   <button
                     onClick={handleGenerateDrafts}
                     disabled={isGenerating || !baseUrl}
                     className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition-all whitespace-nowrap ${
                       isGenerating || !baseUrl
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-brand-600 hover:bg-brand-700 hover:shadow-md'
                     }`}
                   >
                     {isGenerating ? '...' : <><Zap className="w-4 h-4" /> Üret (Taslak)</>}
                   </button>
                 </div>

                 {/* Save Button (Conditional) */}
                 {unsavedCount > 0 && (
                   <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md animate-pulse hover:animate-none transition"
                   >
                     {isSaving ? (
                       'Kaydediliyor...'
                     ) : (
                       <>
                         <CheckCircle className="w-5 h-5" />
                         {unsavedCount} Kaydı Sakla
                       </>
                     )}
                   </button>
                 )}

               </div>
             </div>
          )}
        </header>

        {/* Content Body */}
        <div className="p-8">
          
          {view === 'records' && (
            <RecordsPage 
              records={records} 
              onDelete={handleDelete} 
              onRefresh={loadData}
            />
          )}
          
          {view === 'settings' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-brand-50 rounded-lg">
                  <Settings className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Hedef Adres Yapılandırması</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    QR kodların yönleneceği web sitesinin kök adresini buraya giriniz. 
                    Bu ayar veritabanına kaydedilir.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Kök Web Adresi (Base URL)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={tempBaseUrl}
                    onChange={(e) => setTempBaseUrl(e.target.value)}
                    placeholder="https://ornek.com/dogrula"
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Örnek: <code>https://uygulamam.com/v/</code>. Sonuç: <code>https://uygulamam.com/v/aB3d9X</code>
                </p>

                <div className="pt-4 flex justify-end">
                   <button
                     onClick={handleSaveSettings}
                     disabled={isSavingSettings}
                     className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition"
                   >
                     {isSavingSettings ? (
                        'Kaydediliyor...'
                     ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Ayarları Veritabanına Kaydet
                        </>
                     )}
                   </button>
                </div>
              </div>
            </div>
          )}

          {view === 'search' && (
            <div className="max-w-xl mx-auto space-y-8">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                 <div className="mx-auto bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                   <ScanLine className="w-8 h-8 text-brand-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Kayıtlı QR Kodu Bul</h2>
                 <p className="text-gray-500 mb-6">
                   QR kodunu yeniden görüntülemek veya indirmek için 6 haneli kısa kodu aşağıya giriniz.
                 </p>
                 
                 <form onSubmit={handleSearchSingleCode} className="flex gap-2 max-w-sm mx-auto">
                    <input 
                      type="text" 
                      value={searchCodeInput}
                      onChange={(e) => setSearchCodeInput(e.target.value)}
                      placeholder="Örn: aB3d9X"
                      className="flex-1 px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none uppercase"
                      maxLength={6}
                    />
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition"
                    >
                      Ara
                    </button>
                 </form>
               </div>

               {hasSearched && (
                 <div className="flex justify-center animate-fade-in">
                   {foundRecord ? (
                     <div className="w-full max-w-sm">
                       <div className="text-center mb-4">
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                           <CheckCircle className="w-4 h-4" /> Kayıt Bulundu
                         </span>
                       </div>
                       <QRCard record={foundRecord} onDelete={handleDelete} />
                     </div>
                   ) : (
                     <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-6 text-center max-w-sm w-full">
                       <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                       <h3 className="font-bold">Kayıt Bulunamadı</h3>
                       <p className="text-sm mt-1">
                         Girilen <strong>{searchCodeInput}</strong> koduna ait bir kayıt veritabanında mevcut değil.
                       </p>
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}

          {view === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Toolbar: Search + View Toggles */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {records.length > 0 && (
                  <div className="relative max-w-md w-full sm:w-auto">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                     <input 
                        type="text" 
                        placeholder="Listede filtrele..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none"
                     />
                  </div>
                )}
                
                {/* View Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setDisplayMode('grid')}
                    className={`p-2 rounded transition ${displayMode === 'grid' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Kart Görünümü"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('list')}
                    className={`p-2 rounded transition ${displayMode === 'list' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Liste Görünümü"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              {records.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Henüz QR Kod Oluşturulmadı</h3>
                  <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    {baseUrl 
                      ? "Yukarıdan adet girip 'Üret' butonuna basarak taslak oluşturun, ardından 'Kaydet'e basarak veritabanına işleyin."
                      : "Başlamak için Ayarlar menüsünden Kök URL adresini giriniz."
                    }
                  </p>
                </div>
              ) : (
                <>
                  {displayMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredRecords.map((record) => (
                        <QRCard 
                          key={record.id} 
                          record={record} 
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <QRTable 
                      records={filteredRecords} 
                      onDelete={handleDelete} 
                    />
                  )}
                  
                  {filteredRecords.length === 0 && (
                    <div className="text-center text-gray-500 py-10 w-full bg-white rounded-lg">
                      "{searchTerm}" için sonuç bulunamadı.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;