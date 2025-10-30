import { Routes, Route } from 'react-router-dom';
import SidePanel from './components/SidePanel';
import SemanticDashboard from './pages/SemanticDashboard';
import ConversationPage from './pages/ConversationPage';
import ClientDashboard from './pages/ClientDashboard';
import Overview from './pages/Overview';
import Meetings from './pages/Meetings';


function App() {
  return (
    <div className="flex">
      <SidePanel />
      <main className="flex-1">
        <Routes>
          <Route path="/overview" element={<Overview />} />
          <Route path="/" element={<SemanticDashboard />} />
          <Route path="/conversations" element={<ConversationPage />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/client" element={<ClientDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;