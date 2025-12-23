import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useStore';
import { X, Plus, Trash2, Image as ImageIcon, Rss, Download, Upload, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, toggleSettings, 
    backgroundImage, setBackgroundImage,
    feeds, addFeed, removeFeed,
    steamId, setSteamId,
    calendarUrl, setCalendarUrl,
    importData,
    tasks, events, links, searchEngine
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'feeds' | 'data'>('general');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [bgUrlInput, setBgUrlInput] = useState(backgroundImage || '');
  const [steamIdInput, setSteamIdInput] = useState(steamId || '');
  const [calendarUrlInput, setCalendarUrlInput] = useState(calendarUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeedUrl && newFeedName) {
      addFeed(newFeedUrl, newFeedName);
      setNewFeedUrl('');
      setNewFeedName('');
    }
  };

  const handleSaveGeneral = () => {
    setBackgroundImage(bgUrlInput);
  };

  const handleSaveIntegrations = () => {
    setSteamId(steamIdInput);
    setCalendarUrl(calendarUrlInput);
  };

  const handleExport = () => {
    const data = {
      backgroundImage,
      searchEngine,
      tasks,
      feeds,
      events,
      links,
      steamId,
      calendarUrl,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation could go here
        importData(json);
        alert('Configuración importada con éxito.');
      } catch (error) {
        console.error('Import failed', error);
        alert('Error al leer el archivo. Asegúrate de que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleSettings} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Configuración</h2>
          <button onClick={toggleSettings} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-white/5 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'integrations' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Integraciones
          </button>
          <button 
            onClick={() => setActiveTab('feeds')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'feeds' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Fuentes RSS
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Copia de Seguridad
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} /> Fondo de Pantalla (URL)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={bgUrlInput}
                    onChange={(e) => setBgUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                  <button 
                    onClick={handleSaveGeneral}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Guardar
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-2">
                  Tip: Usa imágenes de Unsplash o Wallhaven para mejor calidad.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {/* Steam Config */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  Steam (Lista de Deseados)
                </h3>
                <label className="block text-xs text-white/50 mb-2">Steam ID64 (Público)</label>
                <input 
                  type="text" 
                  value={steamIdInput}
                  onChange={(e) => setSteamIdInput(e.target.value)}
                  placeholder="Ej. 76561198000000000"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none mb-2"
                />
                <p className="text-xs text-white/30 mb-4">
                  Tu perfil de Steam debe ser "Público" para que esto funcione. Puedes encontrar tu ID en steamdb.info/calculator.
                </p>
              </div>

              {/* Google Calendar Config */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  Google Calendar
                </h3>
                <label className="block text-xs text-white/50 mb-2">URL Privada en formato iCal (.ics)</label>
                <input 
                  type="text" 
                  value={calendarUrlInput}
                  onChange={(e) => setCalendarUrlInput(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none mb-2"
                />
                <p className="text-xs text-white/30">
                  En Google Calendar: Configuración {'>'} Tu Calendario {'>'} Integrar calendario {'>'} Dirección secreta en formato iCal.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveIntegrations}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Guardar Integraciones
                </button>
              </div>
            </div>
          )}

          {activeTab === 'feeds' && (
            <div className="space-y-6">
              <form onSubmit={handleAddFeed} className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3">Añadir nueva fuente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input 
                    type="text" 
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    placeholder="Nombre (ej. Blog de Diseño)"
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                  <input 
                    type="url" 
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    placeholder="URL del RSS / Atom"
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newFeedName || !newFeedUrl}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Añadir Fuente
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/70">Mis Fuentes ({feeds.length})</h3>
                {feeds.map(feed => (
                  <div key={feed.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/20 text-orange-400 p-2 rounded-lg">
                        <Rss size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{feed.name}</p>
                        <p className="text-xs text-white/40 truncate max-w-[200px]">{feed.url}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFeed(feed.id)}
                      className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-blue-400 font-bold mb-2 text-sm flex items-center gap-2">
                  <Save size={16} />
                  Portabilidad
                </h3>
                <p className="text-xs text-blue-200/60 leading-relaxed">
                  Tus datos se guardan en este navegador. Si quieres usar tu configuración en otro PC o hacer una copia de seguridad, usa estas opciones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white mb-4">
                    <Download size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-1">Exportar Configuración</h3>
                  <p className="text-xs text-white/40 mb-4">
                    Descarga un archivo .json con tus tareas, feeds, enlaces y ajustes.
                  </p>
                  <button 
                    onClick={handleExport}
                    className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Descargar Copia
                  </button>
                </div>

                {/* Import */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white mb-4">
                    <Upload size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-1">Importar Configuración</h3>
                  <p className="text-xs text-white/40 mb-4">
                    Restaura una copia de seguridad desde un archivo .json.
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".json"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/10"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
