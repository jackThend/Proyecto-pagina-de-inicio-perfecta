import React from 'react';
import { Calendar, Rss, CheckCircle2 } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'calendar' | 'feed' | 'tasks';
  onTabChange: (tab: 'calendar' | 'feed' | 'tasks') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-t border-white/10 lg:hidden flex items-center justify-around z-50 pb-safe">
      <button 
        onClick={() => onTabChange('calendar')}
        className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'calendar' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}
      >
        <Calendar size={24} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Agenda</span>
      </button>
      
      <button 
        onClick={() => onTabChange('feed')}
        className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'feed' ? 'text-orange-400' : 'text-white/40 hover:text-white'}`}
      >
        <Rss size={24} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Noticias</span>
      </button>
      
      <button 
        onClick={() => onTabChange('tasks')}
        className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${activeTab === 'tasks' ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}
      >
        <CheckCircle2 size={24} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Tareas</span>
      </button>
    </div>
  );
};