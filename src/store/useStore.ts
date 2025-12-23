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
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: 'holiday' | 'personal';
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

interface AppState {
  backgroundImage: string | null;
  searchEngine: 'google' | 'duckduckgo' | 'bing';
  tasks: Task[];
  feeds: Feed[];
  events: CalendarEvent[];
  links: QuickLink[];
  isSettingsOpen: boolean;
  steamId: string | null;
  calendarUrl: string | null;
  setBackgroundImage: (url: string | null) => void;
  setSearchEngine: (engine: 'google' | 'duckduckgo' | 'bing') => void;
  setSteamId: (id: string | null) => void;
  setCalendarUrl: (url: string | null) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addFeed: (url: string, name: string) => void;
  removeFeed: (id: string) => void;
  addEvent: (title: string, date: string) => void;
  removeEvent: (id: string) => void;
  addLink: (title: string, url: string) => void;
  removeLink: (id: string) => void;
  importData: (data: Partial<AppState>) => void;
  toggleSettings: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      backgroundImage: null,
      searchEngine: 'google',
      tasks: [],
      feeds: [
        { id: '1', name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
        { id: '2', name: 'Wired', url: 'https://www.wired.com/feed/rss' }
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
      setBackgroundImage: (url) => set({ backgroundImage: url }),
      setSearchEngine: (engine) => set({ searchEngine: engine }),
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
      addFeed: (url, name) => set((state) => ({
        feeds: [...state.feeds, { id: crypto.randomUUID(), url, name }]
      })),
      removeFeed: (id) => set((state) => ({
        feeds: state.feeds.filter((f) => f.id !== id)
      })),
      addEvent: (title, date) => set((state) => ({
        events: [...state.events, { id: crypto.randomUUID(), title, date, type: 'personal' }]
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
        isSettingsOpen: true // Keep settings open to show success
      })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    }),
    {
      name: 'project-nexus-storage',
    }
  )
);
