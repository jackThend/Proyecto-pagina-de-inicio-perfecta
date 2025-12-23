import React, { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { Plus, X, Globe, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickLinks: React.FC = () => {
  const { links, addLink, removeLink } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const getFavicon = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl && newTitle) {
      let finalUrl = newUrl;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      addLink(newTitle, finalUrl);
      setNewUrl('');
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-3xl">
        
        <AnimatePresence>
          {links.map((link) => (
            <motion.div 
              key={link.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="group relative"
            >
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 w-16 transition-transform hover:-translate-y-1"
                title={link.title}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center group-hover:bg-white/20 transition-colors shadow-lg overflow-hidden">
                  <img 
                    src={getFavicon(link.url)} 
                    alt={link.title}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Globe className="w-6 h-6 text-white/50 hidden" />
                </div>
                <span className="text-[10px] text-white/60 font-medium truncate w-full text-center group-hover:text-white transition-colors">
                  {link.title}
                </span>
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeLink(link.id);
                }}
                className="absolute -top-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-sm z-10"
              >
                <X size={10} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Button */}
        <div className="relative">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`w-12 h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all ${isAdding ? 'bg-white/10 text-white border-white/50' : ''}`}
            title="Añadir atajo"
          >
            <Plus size={20} className={isAdding ? 'rotate-45 transition-transform' : 'transition-transform'} />
          </button>

          {/* Popover Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.form 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                onSubmit={handleAdd}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2"
              >
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nombre (ej. Netflix)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="URL (ej. netflix.com)"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                />
                <button 
                  type="submit"
                  disabled={!newUrl || !newTitle}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 rounded transition-colors disabled:opacity-50"
                >
                  Guardar
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
