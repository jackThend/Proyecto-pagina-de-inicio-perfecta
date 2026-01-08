import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useStore';
import { X, Plus, Trash2, Image as ImageIcon, Rss, Download, Upload, Save, Search, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, toggleSettings, 
    backgrounds, addBackground, removeBackground, activeBackground,
    isTransparentMode, toggleTransparentMode,
    feeds, addFeed, removeFeed,
    importData,
    tasks, events, links,
    searchProviders, addSearchProvider, removeSearchProvider, activeSearchProviderId,
    steamId: _steamId,
    calendarUrl: _calendarUrl
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'feeds' | 'search' | 'data' | 'help'>('general');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedCategory, setNewFeedCategory] = useState<'news' | 'opportunities'>('news');
  const [newBgInput, setNewBgInput] = useState('');
  
  const [newSearchName, setNewSearchName] = useState('');
  const [newSearchUrl, setNewSearchUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset tab when opening
  useEffect(() => {
    if (isSettingsOpen) {
      setActiveTab('general');
    }
  }, [isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeedUrl && newFeedName) {
      addFeed(newFeedUrl, newFeedName, newFeedCategory);
      setNewFeedUrl('');
      setNewFeedName('');
    }
  };

  const handleAddSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSearchName && newSearchUrl && newSearchUrl.includes('%s')) {
      addSearchProvider(newSearchName, newSearchUrl);
      setNewSearchName('');
      setNewSearchUrl('');
    }
  };

  const handleAddBackground = () => {
    if (newBgInput) {
      addBackground(newBgInput);
      setNewBgInput('');
    }
  };

  const handleExport = () => {
    const data = {
      backgrounds,
      searchProviders,
      activeSearchProviderId,
      tasks,
      feeds,
      events,
      links,
      steamId: _steamId,
      calendarUrl: _calendarUrl,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telperion-backup-${new Date().toISOString().split('T')[0]}.json`;
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
        <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Configuración</h2>
          <button onClick={toggleSettings} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-white/5 overflow-x-auto custom-scrollbar flex-shrink-0 bg-black/20">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            General
          </button>
          {/* Integration Tab Hidden - For Future Use */}
          <button 
            onClick={() => setActiveTab('feeds')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'feeds' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Fuentes RSS
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'search' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Buscadores
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Datos
          </button>
          <button 
            onClick={() => setActiveTab('help')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'help' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            Ayuda
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} /> Fondos de Pantalla
                </label>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newBgInput}
                    onChange={(e) => setNewBgInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                  <button onClick={handleAddBackground} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Añadir</button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar bg-black/20 p-2 rounded-xl">
                  {backgrounds.length === 0 && <p className="text-xs text-white/30 text-center py-4">No hay fondos guardados.</p>}
                  {backgrounds.map((bg, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${activeBackground === bg ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/5'}`}>
                      <div className="w-10 h-10 rounded bg-black/50 overflow-hidden flex-shrink-0">
                        <img src={bg} alt="bg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs text-white/60 truncate">{bg}</p>
                         {activeBackground === bg && <span className="text-[10px] text-blue-400 font-bold uppercase">Activo</span>}
                      </div>
                      <button onClick={() => removeBackground(bg)} className="p-1.5 text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isTransparentMode ? 'bg-blue-600' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isTransparentMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" checked={isTransparentMode} onChange={toggleTransparentMode} className="hidden" />
                  <div>
                    <span className="block text-sm font-medium text-white group-hover:text-blue-300 transition-colors">Modo Transparente</span>
                    <span className="block text-xs text-white/40">Haz los widgets semitransparentes para ver mejor el fondo.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'feeds' && (
            <div className="space-y-6">
              <form onSubmit={handleAddFeed} className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3">Añadir nueva fuente</h3>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setNewFeedCategory('news')} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${newFeedCategory === 'news' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/20 text-white/40 border-white/5'}`}>📰 Noticias</button>
                  <button type="button" onClick={() => setNewFeedCategory('opportunities')} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${newFeedCategory === 'opportunities' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-black/20 text-white/40 border-white/5'}`}>💼 Oportunidades</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={newFeedName} onChange={(e) => setNewFeedName(e.target.value)} placeholder="Nombre" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  <input type="url" value={newFeedUrl} onChange={(e) => setNewFeedUrl(e.target.value)} placeholder="URL RSS" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" />
                </div>
                <button type="submit" disabled={!newFeedName || !newFeedUrl} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Plus size={16} /> Añadir Fuente</button>
              </form>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/70">Mis Fuentes ({feeds.length})</h3>
                {feeds.map(feed => (
                  <div key={feed.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/20 text-orange-400 p-2 rounded-lg"><Rss size={16} /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{feed.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${feed.category === 'opportunities' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{feed.category === 'opportunities' ? 'Oportunidad' : 'Noticia'}</span>
                        </div>
                        <p className="text-xs text-white/40 truncate max-w-[200px]">{feed.url}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFeed(feed.id)} className="p-2 text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              <form onSubmit={handleAddSearch} className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Search size={16} /> Añadir Buscador</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={newSearchName} onChange={(e) => setNewSearchName(e.target.value)} placeholder="Nombre" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" />
                  <input type="text" value={newSearchUrl} onChange={(e) => setNewSearchUrl(e.target.value)} placeholder="URL con %s" className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" />
                </div>
                <button type="submit" disabled={!newSearchName || !newSearchUrl || !newSearchUrl.includes('%s')} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Plus size={16} /> Añadir Buscador</button>
              </form>
              <div className="space-y-2">
                {searchProviders.map(provider => (
                  <div key={provider.id} className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 ${activeSearchProviderId === provider.id ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeSearchProviderId === provider.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}><Search size={16} /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{provider.name}</p>
                          {activeSearchProviderId === provider.id && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded uppercase font-bold">Activo</span>}
                        </div>
                        <p className="text-xs text-white/40 truncate max-w-[200px]">{provider.url}</p>
                      </div>
                    </div>
                    {activeSearchProviderId !== provider.id && <button onClick={() => removeSearchProvider(provider.id)} className="p-2 text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col gap-2">
                <h3 className="text-blue-400 font-bold text-sm flex items-center gap-2"><Save size={16} /> Portabilidad</h3>
                <p className="text-xs text-blue-200/60 leading-relaxed">Tus datos viven en tu navegador. Exporta tu archivo <code>.json</code> para tener un respaldo o llevar tu configuración a otro PC.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white mb-4"><Download size={24} /></div>
                  <h3 className="font-bold text-white mb-1 text-sm">Exportar</h3>
                  <button onClick={handleExport} className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs mt-4">Descargar Backup</button>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white mb-4"><Upload size={24} /></div>
                  <h3 className="font-bold text-white mb-1 text-sm">Importar</h3>
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/20 transition-colors text-xs border border-white/10 mt-4">Cargar Archivo</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-8 pb-10">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <HelpCircle size={24} className="text-blue-400" /> Guía de Telperion
                </h3>
                <div className="space-y-6 text-xs text-white/60 leading-relaxed">
                  <section>
                    <h4 className="text-sm font-bold text-orange-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Rss size={16} /> Lector de Noticias</h4>
                    <p>Telperion lee archivos RSS para traerte las novedades. La mayoría de los sitios tienen uno oculto.</p>
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-white/40">
                      <li>Prueba añadir <code>/feed/</code> o <code>/rss</code> al final de cualquier URL.</li>
                      <li>Para blogs de <strong>Blogger</strong>, usa: <code>/feeds/posts/default</code>.</li>
                      <li>Usa la pestaña <strong>"Oportunidades"</strong> para separar temas de trabajo.</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Search size={16} /> Buscadores</h4>
                    <p>Puedes añadir cualquier sitio que tenga buscador (YouTube, Wikipedia, GitHub, etc).</p>
                    <p className="mt-2 text-white/40 italic">Usa el código <code>%s</code> donde iría tu búsqueda en la URL. Ej: <code>youtube.com/results?search_query=%s</code></p>
                  </section>
                  <section>
                    <h4 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Save size={16} /> Privacidad</h4>
                    <p>Telperion es <strong>"Local-First"</strong>. Tus datos viven exclusivamente en tu navegador. No hay servidores rastreándote. Exporta tus datos regularmente para no perderlos.</p>
                  </section>
                </div>
              </div>
              <div className="text-center pt-6">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 mb-2">Telperion Dashboard</p>
                <p className="text-xs italic text-blue-400/50 px-8">Todo está creado con amor, privacidad e independencia por VirtualBrain © 2025</p>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};