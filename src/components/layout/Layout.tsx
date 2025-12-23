import React from 'react';
import { Header } from './Header';
import { useAppStore } from '../../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, leftPanel, rightPanel }) => {
  const { backgroundImage } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ 
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          opacity: backgroundImage ? 1 : 0 
        }}
      />
      {/* Fallback/Overlay Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        <main className="flex-1 overflow-hidden p-6 pt-28 container mx-auto max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Calendar/Agenda */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-4 min-h-full">
                {leftPanel}
              </div>
            </aside>

            {/* Center Column: Feed (The Core) */}
            <section className="col-span-1 lg:col-span-6 xl:col-span-6 h-full overflow-y-auto px-2 custom-scrollbar">
               {children}
            </section>

            {/* Right Column: Tasks */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 h-full overflow-y-auto pl-2 custom-scrollbar">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-4 min-h-full">
                {rightPanel}
              </div>
            </aside>

          </div>
        </main>
      </div>
    </div>
  );
};
