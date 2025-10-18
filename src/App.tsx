import { useState } from 'react';
import { ClientDashboard } from './components/ClientDashboard';
import { SemanticDashboard } from './components/SemanticDashboard';
import { Users, Brain, BarChart3 } from 'lucide-react';

type DashboardView = 'clients' | 'semantic';

function App() {
  const [activeView, setActiveView] = useState<DashboardView>('clients');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sales AI Analytics</h1>
                <p className="text-xs text-gray-500">Real-time call analysis & client management</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveView('clients')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'clients'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Client Data & Call History
            </button>

            <button
              onClick={() => setActiveView('semantic')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'semantic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Brain className="w-4 h-4" />
              Semantic Analysis
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'clients' ? <ClientDashboard /> : <SemanticDashboard />}
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by AI-driven conversation analysis
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
