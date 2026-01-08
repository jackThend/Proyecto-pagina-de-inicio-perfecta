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
  
  // Optimized Selectors
  const toggleSettings = useAppStore(state => state.toggleSettings);
  const steamId = useAppStore(state => state.steamId);
  const searchProviders = useAppStore(state => state.searchProviders);
  const activeSearchProviderId = useAppStore(state => state.activeSearchProviderId);
  const setActiveSearchProvider = useAppStore(state => state.setActiveSearchProvider);

  const [searchTerm, setSearchTerm] = useState('');
  
  const { weather, locationName, loading: weatherLoading } = useWeather();
  const { deals, loading: dealsLoading } = useGameDeals();
  const [showDeals, setShowDeals] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  
  const [wishlist, setWishlist] = useState<SteamGame[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [activeDealsTab, setActiveDealsTab] = useState<'free' | 'wishlist'>('free');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    const activeProvider = searchProviders.find(p => p.id === activeSearchProviderId);
    if (!activeProvider || !searchTerm.trim()) return;
    const url = activeProvider.url.replace('%s', encodeURIComponent(searchTerm.trim()));
    window.open(url, '_blank');
    setSearchTerm('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-0 pointer-events-none">
      <div className="w-full h-20 lg:h-28 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-8 pointer-events-auto shadow-2xl transition-all">
        
        {/* Extreme Left: Ghost Logo */}
        <div className="flex-shrink-0 mr-2 lg:mr-6">
          <motion.img 
              src="/fantasma.ico" 
              alt="Nexus Ghost"
              className="hidden md:block w-16 h-16 lg:w-32 lg:h-32 object-contain drop-shadow-lg cursor-pointer opacity-90 hover:opacity-100"
              animate={{ y: [-5, 5] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              whileHover={{ scale: 1.1, rotate: 5, filter: "drop-shadow(0 0 15px rgba(255,255,255,0.5))" }}
          />
        </div>

        {/* Left: Info */}
        <div className="flex items-center gap-2 lg:gap-8 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-xl lg:text-4xl font-light tracking-tighter text-white">
              {format(time, 'HH:mm')}
            </span>
            <span className="hidden md:block text-sm text-white/60 uppercase tracking-widest font-medium">
              {format(time, "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>
          <div className="hidden lg:block h-12 w-px bg-white/10 mx-2" />
          <div className="relative hidden lg:block">
            <button onClick={() => setShowDeals(!showDeals)} className={`group flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl transition-all border border-transparent ${showDeals ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 hover:border-white/5'}`}>
              <Gamepad2 className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white">Ofertas</span>
            </button>
            <AnimatePresence>
              {showDeals && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-4 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[80vh]">
                  {/* Removed Tabs Selector - Showing only Free Games */}
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {dealsLoading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-white/30" /></div> : 
                    deals.length > 0 ? deals.map(deal => (
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
                    )) : <div className="p-4 text-center text-white/40 text-sm">No hay ofertas gratis hoy.</div>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0 max-w-full lg:max-w-4xl mx-2 lg:mx-12">
           <button type="button" onClick={() => setShowQuickLinks(!showQuickLinks)} className={`flex-shrink-0 w-8 h-8 lg:w-14 lg:h-14 rounded-lg lg:rounded-2xl flex items-center justify-center transition-all border ${showQuickLinks ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10'}`}>
             <Star size={16} className="lg:w-6 lg:h-6" fill={showQuickLinks ? "currentColor" : "none"} />
           </button>
          <form onSubmit={handleSearch} className="relative group shadow-2xl flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2 lg:pl-5 flex items-center pointer-events-none">
              <Search className="h-3 w-3 lg:h-6 lg:w-6 text-white/40 group-focus-within:text-white/80 transition-colors" />
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-8 lg:h-14 bg-slate-900/90 border border-white/10 text-white text-xs lg:text-lg rounded-lg lg:rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 block w-full pl-8 lg:pl-14 pr-16 lg:pr-32 placeholder-white/20 transition-all hover:bg-slate-900 shadow-inner truncate" placeholder={`Buscar...`} />
            <div className="absolute inset-y-0 right-1 lg:right-3 flex items-center">
               <select 
                 value={activeSearchProviderId} 
                 onChange={(e) => setActiveSearchProvider(e.target.value)} 
                 className="bg-white/5 text-[10px] lg:text-xs font-bold text-white/70 border border-white/10 rounded lg:rounded-lg py-0.5 lg:py-1 pl-1 lg:pl-3 pr-4 lg:pr-8 focus:ring-0 cursor-pointer hover:text-white hover:bg-white/10 outline-none appearance-none text-left tracking-wider w-[60px] lg:w-[120px]"
               >
                 {searchProviders.map(provider => (
                   <option key={provider.id} value={provider.id} className="bg-slate-800">{provider.name}</option>
                 ))}
               </select>
               <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-white/40 absolute right-0.5 lg:right-2 pointer-events-none" />
            </div>
          </form>
        </div>

        {/* Right: Weather & Config */}
        <div className="flex items-center gap-2 lg:gap-6 flex-shrink-0">
          <div className="flex items-center gap-1 lg:gap-4 bg-white/5 border border-white/5 rounded-lg lg:rounded-2xl p-1 lg:p-2 lg:pr-6 transition-colors hover:bg-white/10">
            {weatherLoading ? <div className="h-6 w-6 lg:h-10 lg:w-10 bg-white/10 animate-pulse rounded-full" /> : (
               <>
                 <div className="flex items-center gap-1 lg:gap-3 lg:pr-4 lg:border-r border-white/10 pl-1 lg:pl-2">
                   {getWeatherIcon(weather?.current.weatherCode || 0, 20, weather?.current.isDay)}
                   <div className="flex flex-col">
                     <span className="text-sm lg:text-2xl font-bold text-white leading-none">{weather ? `${Math.round(weather.current.temperature)}°` : '--'}</span>
                     <span className="hidden lg:block text-[10px] text-white/50 font-medium uppercase tracking-wider mt-1">{locationName}</span>
                   </div>
                 </div>
                 <div className="hidden lg:flex gap-3 text-center">
                    {weather?.daily.map((day, idx) => (
                      <div key={day.date} className="flex flex-col items-center gap-1 min-w-[30px]">
                        <span className="text-[10px] font-bold text-white/40 uppercase">{idx === 0 ? 'Hoy' : format(addDays(new Date(), idx), 'EEE', { locale: es })}</span>
                        {getWeatherIcon(day.code, 18, true)}
                        <span className="text-xs font-medium text-white/80">{Math.round(day.max)}°</span>
                      </div>
                    ))}
                 </div>
               </>
            )}
          </div>
          <button onClick={toggleSettings} className="w-8 h-8 lg:w-12 lg:h-12 rounded-full border border-transparent hover:bg-white/10 hover:border-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center" aria-label="Configuración">
            <Settings className="w-4 h-4 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showQuickLinks && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="pointer-events-auto mt-2 z-40 w-full">
            <QuickLinks />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};