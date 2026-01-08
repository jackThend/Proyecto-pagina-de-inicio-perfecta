import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { TaskManager } from './components/ui/TaskManager';
import { FeedReader } from './components/ui/FeedReader';
import { CalendarWidget } from './components/ui/CalendarWidget';
import { SettingsModal } from './components/ui/SettingsModal';
import { useAppStore } from './store/useStore';

function App() {
  const rotateBackground = useAppStore((state) => state.rotateBackground);

  useEffect(() => {
    rotateBackground();
  }, []);

  return (
    <>
      <SettingsModal />
      <Layout
        leftPanel={<CalendarWidget />}
        rightPanel={<TaskManager />}
      >
        <FeedReader />
      </Layout>
    </>
  );
}

export default App;
// Force re-save
