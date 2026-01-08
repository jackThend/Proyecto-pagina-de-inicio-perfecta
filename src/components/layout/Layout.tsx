import React, { useState } from 'react';
import { Header } from './Header';
import { useAppStore } from '../../store/useStore';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, leftPanel, rightPanel }) => {
  const { activeBackground, isTransparentMode } = useAppStore();
  const [activeMobileTab, setActiveMobileTab] = useState<'calendar' | 'feed' | 'tasks'>('feed');

  const panelClass = isTransparentMode 
    ? "bg-black/20 rounded-2xl p-4 min-h-full transition-all duration-500 border border-white/5" 
    : "bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-4 min-h-full transition-all duration-500";

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden ${isTransparentMode ? 'text-shadow-sm' : ''}`}>
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ 
          backgroundImage: activeBackground ? `url(${activeBackground})` : 'none',
          opacity: activeBackground ? 1 : 0 
        }}
      />
      {/* Fallback/Overlay Gradient - Reduced in transparent mode */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/90 pointer-events-none transition-opacity duration-500 ${isTransparentMode ? 'opacity-40' : 'opacity-100'}`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        <main className="flex-1 overflow-hidden p-4 lg:p-6 pt-24 lg:pt-32 pb-20 lg:pb-6 container mx-auto max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full mt-2 lg:mt-6">
            
            {/* Left Column: Calendar/Agenda */}
            <aside className={`${activeMobileTab === 'calendar' ? 'block' : 'hidden'} lg:block lg:col-span-3 xl:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar`}>
              <div className={panelClass}>
                {leftPanel}
              </div>
            </aside>

            {/* Center Column: Feed (The Core) */}
            <section className={`${activeMobileTab === 'feed' ? 'block' : 'hidden'} lg:block col-span-1 lg:col-span-6 xl:col-span-6 h-full overflow-y-auto px-2 custom-scrollbar`}>
               {children}
            </section>

            {/* Right Column: Tasks */}
            <aside className={`${activeMobileTab === 'tasks' ? 'block' : 'hidden'} lg:block lg:col-span-3 xl:col-span-3 h-full overflow-y-auto pl-2 custom-scrollbar`}>
              <div className={panelClass}>
                {rightPanel}
              </div>
            </aside>

          </div>
        </main>

        <MobileNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
      </div>
    </div>
  );
};
