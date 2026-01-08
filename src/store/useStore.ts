import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface Feed {
  id: string;
  url: string;
  name: string;
  category: 'news' | 'opportunities';
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Start Date ISO
  endDate?: string; // Optional End Date ISO
  type: 'holiday' | 'personal';
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

interface SearchProvider {
  id: string;
  name: string;
  url: string; // URL with %s placeholder
}

interface AppState {
  // Backgrounds Logic
  backgrounds: string[];
  activeBackground: string | null;
  addBackground: (url: string) => void;
  removeBackground: (url: string) => void;
  setActiveBackground: (url: string) => void;
  rotateBackground: () => void;
  
  // Visual Modes
  isTransparentMode: boolean;
  toggleTransparentMode: () => void;

  // Search Logic (New)
  searchProviders: SearchProvider[];
  activeSearchProviderId: string;
  addSearchProvider: (name: string, url: string) => void;
  removeSearchProvider: (id: string) => void;
  setActiveSearchProvider: (id: string) => void;

  tasks: Task[];
  feeds: Feed[];
  events: CalendarEvent[];
  links: QuickLink[];
  isSettingsOpen: boolean;
  steamId: string | null;
  calendarUrl: string | null;
  
  setSteamId: (id: string | null) => void;
  setCalendarUrl: (url: string | null) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addFeed: (url: string, name: string, category?: 'news' | 'opportunities') => void;
  removeFeed: (id: string) => void;
  addEvent: (title: string, date: string, endDate?: string) => void;
  removeEvent: (id: string) => void;
  addLink: (title: string, url: string) => void;
  removeLink: (id: string) => void;
  importData: (data: Partial<AppState>) => void;
  toggleSettings: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial State
      backgrounds: [],
      activeBackground: null,
      isTransparentMode: false,
      
      // Default Search Providers
      searchProviders: [
        { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
        { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
        { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
        { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' }
      ],
      activeSearchProviderId: 'google',

      tasks: [],
      feeds: [
        { id: '1', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'news' },
        { id: '2', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'news' }
      ], 
      events: [],
      links: [
        { id: '1', title: 'YouTube', url: 'https://youtube.com' },
        { id: '2', title: 'Gmail', url: 'https://mail.google.com' },
        { id: '3', title: 'ChatGPT', url: 'https://chat.openai.com' },
        { id: '4', title: 'GitHub', url: 'https://github.com' }
      ],
      isSettingsOpen: false,
      steamId: null,
      calendarUrl: null,

      // Actions
      addBackground: (url) => set((state) => {
         const newBgs = [...state.backgrounds, url];
         return { 
           backgrounds: newBgs,
           activeBackground: state.activeBackground || url 
         };
      }),
      removeBackground: (url) => set((state) => {
        const newBgs = state.backgrounds.filter(b => b !== url);
        return {
          backgrounds: newBgs,
          activeBackground: state.activeBackground === url ? (newBgs[0] || null) : state.activeBackground
        };
      }),
      setActiveBackground: (url) => set({ activeBackground: url }),
      rotateBackground: () => set((state) => {
        if (state.backgrounds.length === 0) return {};
        const randomIndex = Math.floor(Math.random() * state.backgrounds.length);
        return { activeBackground: state.backgrounds[randomIndex] };
      }),
      toggleTransparentMode: () => set((state) => ({ isTransparentMode: !state.isTransparentMode })),

      addSearchProvider: (name, url) => set((state) => ({
        searchProviders: [...state.searchProviders, { id: crypto.randomUUID(), name, url }]
      })),
      removeSearchProvider: (id) => set((state) => ({
        searchProviders: state.searchProviders.filter(p => p.id !== id),
        // If active one was deleted, switch to first available
        activeSearchProviderId: state.activeSearchProviderId === id ? state.searchProviders[0]?.id || 'google' : state.activeSearchProviderId
      })),
      setActiveSearchProvider: (id) => set({ activeSearchProviderId: id }),

      setSteamId: (id) => set({ steamId: id }),
      setCalendarUrl: (url) => set({ calendarUrl: url }),
      
      addTask: (text) => set((state) => ({
        tasks: [
          { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
          ...state.tasks
        ]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      
      addFeed: (url, name, category = 'news') => set((state) => ({
        feeds: [...state.feeds, { id: crypto.randomUUID(), url, name, category }]
      })),
      removeFeed: (id) => set((state) => ({
        feeds: state.feeds.filter((f) => f.id !== id)
      })),
      
      addEvent: (title, date, endDate) => set((state) => ({
        events: [...state.events, { id: crypto.randomUUID(), title, date, endDate, type: 'personal' }]
      })),
      removeEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      })),
      
      addLink: (title, url) => set((state) => ({
        links: [...state.links, { id: crypto.randomUUID(), title, url }]
      })),
      removeLink: (id) => set((state) => ({
        links: state.links.filter((l) => l.id !== id)
      })),
      
      importData: (data) => set((state) => ({
        ...state,
        ...data,
        isSettingsOpen: true
      })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    }),
    {
      name: 'project-nexus-storage',
      version: 1, // Versioning helps if we change schema
    }
  )
);