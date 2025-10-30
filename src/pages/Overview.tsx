import React, { useState, useEffect } from 'react';
import { BarChart2, Clock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CallData {
  id: number;
  name: string;
  call_duration: number | null;
  disconnection_reason: string | null;
}

const Overview: React.FC = () => {
  const [kpis, setKpis] = useState({
    totalCalls: 0,
    totalDuration: 0,
    avgDuration: 0,
  });
  const [callData, setCallData] = useState<CallData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('call_history')
          .select('id, name, call_duration, disconnection_reason')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setCallData(data || []);
        calculateKpis(data || []);
      } catch (err: any) {
        console.error('Error fetching call data:', err);
        setError(err.message || 'Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const calculateKpis = (data: CallData[]) => {
    const totalCalls = data.length;
    const durations = data
      .map(row => row.call_duration)
      .filter((d): d is number => d !== null && Number.isFinite(d));

    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const avgDuration = durations.length > 0 ? totalDuration / durations.length : 0;

    setKpis({
      totalCalls,
      totalDuration,
      avgDuration,
    });
  };

  const kpiCards = [
    { title: 'Total Calls', value: kpis.totalCalls, icon: <BarChart2 className="w-8 h-8 text-blue-500" /> },
    { title: 'Total Duration', value: `${kpis.totalDuration.toFixed(2)}s`, icon: <Activity className="w-8 h-8 text-purple-500" /> },
    { title: 'Avg Duration', value: `${kpis.avgDuration.toFixed(2)}s`, icon: <Clock className="w-8 h-8 text-green-500" /> },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Overview</h1>

      {error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {kpiCards.map(card => (
              <div key={card.title} className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="mr-4">{card.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call Details Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Call Details</h2>
            <div className="overflow-x-auto">
              {callData.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No call data available</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (s)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disconnection Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {callData.map((row) => (
                      <tr key={row.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.call_duration || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.disconnection_reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
