import { useState, useEffect } from 'react';
import {
  Search,
} from 'lucide-react';
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
  ;

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
    <div className="h-screen bg-gray-100">
      <main className="p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Semantic Analysis</h1>
            <p className="text-gray-500">Analysis of call data from Supabase</p>
          </div>
          
        </header>

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
                {data.length > 0 ? (
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
                      {data.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(row.id).substring(0, 8)}...</td>
                         
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
                    {data.length > 0 ? 'No results found.' : 'Loading data...'}
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
