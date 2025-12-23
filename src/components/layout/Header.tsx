import React, { useState, useEffect } from 'react';
import { Search, Settings, Cloud, Gamepad2, ChevronDown, Loader2, Star, Sun, CloudRain, CloudLightning, CloudSnow, CloudFog } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWeather, getWeatherDescription } from '../../hooks/useWeather';
import { useGameDeals } from '../../hooks/useGameDeals';
import { fetchSteamWishlist, SteamGame } from '../../lib/steam';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickLinks } from '../ui/QuickLinks';

// Helper to get Weather Icon
const getWeatherIcon = (code: number, size: number = 24, isDay: boolean = true) => {
  // Codes based on OpenMeteo WMO
  if (code === 0 || code === 1) return <Sun size={size} className={isDay ? "text-amber-400" : "text-blue-200"} />;
  if (code === 2 || code === 3) return <Cloud size={size} className="text-gray-400" />;
  if ([45, 48].includes(code)) return <CloudFog size={size} className="text-slate-400" />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} className="text-blue-400" />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow size={size} className="text-white" />;
  if ([95, 96, 99].includes(code)) return <CloudLightning size={size} className="text-purple-400" />;
  return <Cloud size={size} className="text-gray-400" />;
};

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { searchEngine, setSearchEngine, toggleSettings, steamId } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hooks & State
  const { weather, locationName, loading: weatherLoading } = useWeather();
  const { deals, loading: dealsLoading } = useGameDeals();
  const [showDeals, setShowDeals] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  
  // Wishlist State
  const [wishlist, setWishlist] = useState<SteamGame[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [activeDealsTab, setActiveDealsTab] = useState<'free' | 'wishlist'>('free');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Wishlist when SteamID changes or popover opens
  useEffect(() => {
    if (steamId && showDeals && activeDealsTab === 'wishlist' && wishlist.length === 0) {
      setLoadingWishlist(true);
      fetchSteamWishlist(steamId)
        .then(setWishlist)
        .finally(() => setLoadingWishlist(false));
    }
  }, [steamId, showDeals, activeDealsTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '';
    switch (searchEngine) {
      case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`; break;
      case 'duckduckgo': url = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`; break;
      case 'bing': url = `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`; break;
    }
    window.open(url, '_blank');
    setSearchTerm('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-0 pointer-events-none">
      
      {/* Top Bar Container */}
      <div className="w-full h-28 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 pointer-events-auto shadow-2xl transition-all">
        {/* Left: Info & Offers */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-4xl font-light tracking-tighter text-white">
              {format(time, 'HH:mm')}
            </span>
            <span className="text-sm text-white/60 uppercase tracking-widest font-medium">
              {format(time, "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>
          
          <div className="h-12 w-px bg-white/10 mx-2" />
          
          <div className="relative">
            <button 
              onClick={() => setShowDeals(!showDeals)}
              className={`group flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl transition-all border border-transparent ${showDeals ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 hover:border-white/5'}`}
            >
              <Gamepad2 className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">
                Ofertas
              </span>
            </button>

            <AnimatePresence>
              {showDeals && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-4 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* Tabs */}
                  <div className="flex border-b border-white/5">
                    <button 
                      onClick={() => setActiveDealsTab('free')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${activeDealsTab === 'free' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Gratis
                    </button>
                    <button 
                      onClick={() => setActiveDealsTab('wishlist')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${activeDealsTab === 'wishlist' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Mi Wishlist
                    </button>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {/* Free Games List */}
                    {activeDealsTab === 'free' && (
                      <>
                        {dealsLoading ? (
                          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-white/30" /></div>
                        ) : deals.length > 0 ? deals.map(deal => (
                          <a key={deal.id} href={deal.open_giveaway_url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-white/5 transition-colors border-b border-white/5">
                            <div className="flex gap-3">
                              <img src={deal.thumbnail} alt={deal.title} className="w-16 h-10 object-cover rounded-lg shadow-sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{deal.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded uppercase font-bold">{deal.type}</span>
                                  <span className="text-[10px] text-white/40">{deal.platforms.split(',')[0]}</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        )) : (
                          <div className="p-4 text-center text-white/40 text-sm">No hay ofertas.</div>
                        )}
                      </>
                    )}

                    {/* Wishlist List */}
                    {activeDealsTab === 'wishlist' && (
                      <>
                        {!steamId ? (
                          <div className="p-6 text-center">
                            <p className="text-sm text-white/60 mb-2">Configura tu Steam ID para ver tus ofertas.</p>
                            <button onClick={toggleSettings} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500">
                              Ir a Configuración
                            </button>
                          </div>
                        ) : loadingWishlist ? (
                          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-white/30" /></div>
                        ) : wishlist.length > 0 ? wishlist.map(game => {
                           const discount = game.subs?.[0]?.discount_pct || 0;
                           const price = game.subs?.[0]?.price ? (parseInt(game.subs[0].price) / 100).toFixed(2) : '???';
                           
                           return (
                            <div key={game.added} className="block p-3 hover:bg-white/5 transition-colors border-b border-white/5">
                              <div className="flex gap-3">
                                <img src={game.capsule} alt={game.name} className="w-16 h-10 object-cover rounded-lg shadow-sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{game.name}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    {discount > 0 ? (
                                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded font-bold">
                                        -{discount}%
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-white/30">Precio normal</span>
                                    )}
                                    <span className="text-xs text-white/60 font-medium">
                                      {discount > 0 ? `$${price}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                           );
                        }) : (
                          <div className="p-4 text-center text-white/40 text-sm">
                            No se pudo cargar la wishlist o está vacía. Asegúrate de que tu perfil sea público.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Search & QuickLinks */}
        <div className="flex items-center gap-4 flex-1 max-w-4xl mx-12">
           {/* Quick Links Toggle Button (Moved Outside) */}
           <button
             type="button"
             onClick={() => setShowQuickLinks(!showQuickLinks)}
             className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${showQuickLinks ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10'}`}
             title="Marcadores Rápidos"
           >
             <Star size={24} fill={showQuickLinks ? "currentColor" : "none"} />
           </button>

          <form onSubmit={handleSearch} className="relative group shadow-2xl flex-1">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-white/40 group-focus-within:text-white/80 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-slate-900/90 border border-white/10 text-white text-lg rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 block w-full pl-14 pr-32 placeholder-white/20 transition-all hover:bg-slate-900 shadow-inner"
              placeholder={`Buscar en ${searchEngine}...`}
            />
            
            {/* Search Engine Select */}
            <div className="absolute inset-y-0 right-3 flex items-center">
               <select 
                 value={searchEngine}
                 onChange={(e) => setSearchEngine(e.target.value as any)}
                 className="bg-white/5 text-xs font-bold text-white/60 border border-white/10 rounded-lg py-1.5 pl-2 pr-6 focus:ring-0 cursor-pointer hover:text-white hover:bg-white/10 outline-none appearance-none text-right uppercase tracking-wider"
               >
                 <option value="google" className="bg-slate-800">Google</option>
                 <option value="duckduckgo" className="bg-slate-800">Duck</option>
                 <option value="bing" className="bg-slate-800">Bing</option>
               </select>
               <ChevronDown className="w-3 h-3 text-white/40 absolute right-2 pointer-events-none" />
            </div>
          </form>
        </div>

        {/* Right: Weather Widget (Enhanced) & Config */}
        <div className="flex items-center gap-6">
          
          {/* Enhanced Weather Widget */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-2 pr-6 transition-colors hover:bg-white/10">
            {weatherLoading ? (
               <div className="flex gap-4 p-2">
                 <div className="h-10 w-10 bg-white/10 animate-pulse rounded-full" />
                 <div className="h-10 w-20 bg-white/10 animate-pulse rounded-lg" />
               </div>
            ) : (
               <>
                 {/* Today Main */}
                 <div className="flex items-center gap-3 pr-4 border-r border-white/10 pl-2">
                   {getWeatherIcon(weather?.current.weatherCode || 0, 40, weather?.current.isDay)}
                   <div className="flex flex-col">
                     <span className="text-2xl font-bold text-white leading-none">
                       {weather ? `${Math.round(weather.current.temperature)}°` : '--'}
                     </span>
                     <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-1">
                       {locationName}
                     </span>
                   </div>
                 </div>

                 {/* Forecast Columns */}
                 <div className="flex gap-3 text-center">
                    {weather?.daily.map((day, idx) => (
                      <div key={day.date} className="flex flex-col items-center gap-1 min-w-[30px]">
                        <span className="text-[10px] font-bold text-white/40 uppercase">
                           {idx === 0 ? 'Hoy' : format(addDays(new Date(), idx), 'EEE', { locale: es })}
                        </span>
                        {getWeatherIcon(day.code, 18, true)}
                        <span className="text-xs font-medium text-white/80">
                          {Math.round(day.max)}°
                        </span>
                      </div>
                    ))}
                 </div>
               </>
            )}
          </div>
          
          <button 
            onClick={toggleSettings}
            className="w-12 h-12 rounded-full border border-transparent hover:bg-white/10 hover:border-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center"
            aria-label="Configuración"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Quick Links Dropdown Panel */}
      <AnimatePresence>
        {showQuickLinks && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto mt-2 z-40 w-full"
          >
            <QuickLinks />
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};