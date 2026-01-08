import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store/useStore';
import { fetchFeed, FeedItem } from '../../lib/rss';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, RefreshCw, Rss } from 'lucide-react';
import { motion } from 'framer-motion';

// Small sub-component for each article to handle its own image error state
const FeedArticle: React.FC<{ item: FeedItem, idx: number }> = ({ item, idx }) => {
  const [imageVisible, setImageVisible] = useState(!!item.image);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }} // Animate only when in view
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.4 }}
      className="break-inside-avoid bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors group flex flex-col mb-4"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
            {item.sourceName}
          </span>
          <span className="text-[10px] text-white/40">
            {item.isoDate ? formatDistanceToNow(new Date(item.isoDate), { addSuffix: true, locale: es }) : ''}
          </span>
        </div>
        
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group-hover:text-blue-300 transition-colors">
          {item.image && imageVisible && (
            <div className="mb-3 rounded-lg overflow-hidden h-40 w-full relative bg-black/20">
               <img 
                 src={item.image} 
                 alt={item.title} 
                 loading="lazy" // Native Lazy Loading
                 className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                 onError={() => setImageVisible(false)}
               />
            </div>
          )}
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
            {item.title}
          </h3>
        </a>
        
        <p className="text-sm text-white/60 line-clamp-3 mb-4">
          {item.contentSnippet}
        </p>

        <div className="flex items-center justify-end border-t border-white/5 pt-3 mt-auto">
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-white/40 flex items-center gap-1 hover:text-white transition-colors"
          >
            Leer más <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.article>
  );
};

export const FeedReader: React.FC = () => {
  const feeds = useAppStore(state => state.feeds);
  const [activeCategory, setActiveCategory] = useState<'news' | 'opportunities'>('news');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshFeeds = async () => {
    setLoading(true);
    setVisibleCount(20);
    setItems([]); 
    
    // Filter feeds by active category
    const activeFeeds = feeds.filter(f => (f.category || 'news') === activeCategory);

    if (activeFeeds.length === 0) {
      setLoading(false);
      return;
    }

    // BATCH FETCHING: Fetch in groups of 3 to avoid overwhelming free proxies
    // while still being faster than sequential 1-by-1
    const BATCH_SIZE = 3;
    const allItems: FeedItem[] = [];

    for (let i = 0; i < activeFeeds.length; i += BATCH_SIZE) {
      const batch = activeFeeds.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(feed => 
        fetchFeed(feed.url, feed.name).catch(err => {
          console.warn(`Failed to load feed: ${feed.name}`, err);
          return [] as FeedItem[];
        })
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(res => allItems.push(...res));
    }
    
    // SHUFFLE LOGIC
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }

    setItems(allItems);
    setLoading(false);
  };

  useEffect(() => {
    refreshFeeds();
  }, [feeds, activeCategory]); // Refresh when feeds OR category changes

  // Infinite Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 300) {
      setVisibleCount(prev => Math.min(prev + 20, items.length));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        
        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveCategory('news')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeCategory === 'news' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Noticias
          </button>
          <button
            onClick={() => setActiveCategory('opportunities')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeCategory === 'opportunities' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Oportunidades
          </button>
        </div>

        <button 
          onClick={refreshFeeds}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors disabled:opacity-50"
          title="Actualizar feeds"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
      >
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-4 pb-4">
            {items.slice(0, visibleCount).map((item, idx) => (
              <FeedArticle key={`${item.link}-${idx}`} item={item} idx={idx} />
            ))}
            
            {!loading && items.length === 0 && (
              <div className="text-center py-20 text-white/30 col-span-full flex flex-col items-center gap-4">
                <Rss size={48} className="opacity-20" />
                <p>No hay {activeCategory === 'news' ? 'noticias' : 'oportunidades'} configuradas.</p>
                <p className="text-xs">Añade fuentes en la configuración.</p>
              </div>
            )}
            
            {visibleCount < items.length && (
               <div className="col-span-full py-4 text-center text-white/30 text-xs animate-pulse">
                 Cargando más...
               </div>
            )}
          </div>
        )}

        {/* Minimalist Footer (Visible only at the very end of everything) */}
        {visibleCount >= items.length && items.length > 0 && (
          <footer className="w-full text-center py-8 opacity-30 hover:opacity-80 transition-opacity duration-500 pb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-white drop-shadow-md">
              Telperion • Creado por VirtualBrain © 2025
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};
