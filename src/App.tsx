import { Routes, Route } from 'react-router-dom';
import SidePanel from './components/SidePanel';
import SemanticDashboard from './pages/SemanticDashboard';
import ConversationPage from './pages/ConversationPage';
import ClientDashboard from './pages/ClientDashboard';
import Overview from './pages/Overview';
import Meetings from './pages/Meetings';
import Reminders from './pages/Reminders';
import Enquiries from './pages/Enquiries';
import Analytics from './pages/Analytics';
import VoiceSettings from './pages/VoiceSettings';
import CallSettings from './pages/CallSettings';
import SystemSettings from './pages/SystemSettings';

function App() {
  return (
    <div className="flex">
      <SidePanel />
      <main className="flex-1 p-8 bg-gray-100">
        <Routes>
          <Route path="/overview" element={<Overview />} />
          <Route path="/" element={<SemanticDashboard />} />
          <Route path="/conversations" element={<ConversationPage />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/enquiries" element={<Enquiries />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings/voice" element={<VoiceSettings />} />
          <Route path="/settings/call" element={<CallSettings />} />
          <Route path="/settings/system" element={<SystemSettings />} />
          <Route path="/client" element={<ClientDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;