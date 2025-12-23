import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { fetchFeed, FeedItem } from '../../lib/rss';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, RefreshCw, Rss } from 'lucide-react';
import { motion } from 'framer-motion';

export const FeedReader: React.FC = () => {
  const { feeds } = useAppStore();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFeeds = async () => {
    setLoading(true);
    const promises = feeds.map(feed => fetchFeed(feed.url, feed.name));
    const results = await Promise.all(promises);
    
    // Flatten and sort by date (newest first)
    const allItems = results.flat().sort((a, b) => {
      const dateA = a.isoDate ? new Date(a.isoDate) : new Date(0);
      const dateB = b.isoDate ? new Date(b.isoDate) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    setItems(allItems);
    setLoading(false);
  };

  useEffect(() => {
    refreshFeeds();
  }, [feeds]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
          <span className="bg-orange-500/10 text-orange-400 p-1.5 rounded-lg">
            <Rss size={20} />
          </span>
          Novedades
        </h2>
        <button 
          onClick={refreshFeeds}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors disabled:opacity-50"
          title="Actualizar feeds"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-4 space-y-4 pb-4">
            {items.map((item, idx) => (
              <motion.article
                key={`${item.link}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="break-inside-avoid bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors group flex flex-col"
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
            ))}
            
            {!loading && items.length === 0 && (
              <div className="text-center py-20 text-white/30 col-span-full">
                No hay noticias disponibles. Revisa tu configuración de feeds.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
