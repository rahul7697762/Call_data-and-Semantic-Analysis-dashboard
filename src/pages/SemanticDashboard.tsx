import { useState, useEffect, useMemo } from 'react';
import { Download, Filter, X } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabase';

interface SemanticData {
  id: string;
  client_call_id: string | null;
  sentiment_score: number | null;
  agent_confidence: number | null;
  positive_indicators: string[];
  negative_indicators: string[];
  predicted_outcome: string | null;
  alert_status: string;
  finish_reason: string | null;
  avg_logprobs: number | null;
  conversation_duration_seconds: number | null;
  total_customer_words: number | null;
  agent_talk_time_percentage: number | null;
  buying_signals: string[];
  created_at: string;
  updated_at: string;
}

const SemanticDashboard = () => {
  
  const [data, setData] = useState<SemanticData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minSentiment: -1,
    maxSentiment: 1,
    startDate: subDays(new Date(), 30).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('semantic_analysis').select('*');
        if (error) {
          throw error;
        }
        setData(data as SemanticData[]);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name.includes('Sentiment') ? parseFloat(value) : value
    }));
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Sentiment Score', 'Agent Confidence', 'Predicted Outcome',
      'Alert Status', 'Duration (s)', 'Customer Words', 'Agent Talk %', 'Created At'
    ].join(',');

    const csvContent = filteredData.map(row => [
      row.id,
      row.sentiment_score?.toFixed(2) || '',
      row.agent_confidence?.toFixed(2) || '',
      `"${row.predicted_outcome || ''}"`,
      `"${row.alert_status || ''}"`,
      row.conversation_duration_seconds || '',
      row.total_customer_words || '',
      row.agent_talk_time_percentage?.toFixed(1) || '',
      new Date(row.created_at).toISOString()
    ].join(','));

    const csv = [headers, ...csvContent].join('');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemDate = new Date(item.created_at).toISOString().split('T')[0];
      const sentiment = item.sentiment_score || 0;
      return (
        sentiment >= filters.minSentiment &&
        sentiment <= filters.maxSentiment &&
        itemDate >= filters.startDate &&
        itemDate <= filters.endDate
      );
    });
  }, [data, filters]);

  const outcomeData = data.reduce((acc, row) => {
    const outcome = row.predicted_outcome;
    if (outcome) {
      acc[outcome] = (acc[outcome] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const outcomeChartData = Object.keys(outcomeData).map(key => ({ name: key, value: outcomeData[key] }));

  const alertData = data.reduce((acc, row) => {
    const alert = row.alert_status;
    if (alert) {
      acc[alert] = (acc[alert] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const alertChartData = Object.keys(alertData).map(key => ({ name: key, value: alertData[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <main>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Semantic Analysis</h1>
            <p className="text-gray-500">Analysis of call data from Supabase</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Sentiment</label>
                <input
                  type="range"
                  name="minSentiment"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={filters.minSentiment}
                  onChange={handleFilterChange}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">{filters.minSentiment.toFixed(1)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Sentiment</label>
                <input
                  type="range"
                  name="maxSentiment"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={filters.maxSentiment}
                  onChange={handleFilterChange}
                  className="w-full"
                />
                <div className="text-sm text-gray-600">{filters.maxSentiment.toFixed(1)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                  max={filters.endDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                  min={filters.startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        )}

        {error ? (
            <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Predicted Outcome</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={outcomeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Alert Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {alertChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                {filteredData.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Confidence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Outcome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (s)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Words</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Talk %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(row.id).substring(0, 8)}</td>
                         
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.sentiment_score && row.sentiment_score > 0.5 ? 'bg-green-100 text-green-800' : 
                              row.sentiment_score && row.sentiment_score < -0.5 ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.sentiment_score?.toFixed(2) || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.agent_confidence?.toFixed(2) || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.predicted_outcome || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.alert_status === 'high' ? 'bg-red-100 text-red-800' :
                              row.alert_status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {row.alert_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.conversation_duration_seconds || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.total_customer_words || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.agent_talk_time_percentage?.toFixed(1) || '-'}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {data.length === 0 ? 'Loading data...' : 'No results match your filters.'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SemanticDashboard;
