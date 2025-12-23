import { Layout } from './components/layout/Layout';
import { TaskManager } from './components/ui/TaskManager';
import { FeedReader } from './components/ui/FeedReader';
import { CalendarWidget } from './components/ui/CalendarWidget';
import { SettingsModal } from './components/ui/SettingsModal';

function App() {
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