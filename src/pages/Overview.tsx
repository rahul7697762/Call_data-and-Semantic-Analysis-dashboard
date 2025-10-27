import React, { useState, useEffect } from 'react';
import { BarChart2, Clock, Activity } from 'lucide-react';

interface SemanticData {
  Name: string;
  Duration: string;
  Dissconnection_reason: string;
}

const Overview: React.FC = () => {
  const [kpis, setKpis] = useState({
    totalCalls: 0,
    totalDuration: 0,
    avgDuration: 0,
  });
  const [callData, setCallData] = useState<SemanticData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/1qRyEXBZZbz8SSJs3Cd8yzFlDWkud4Cdmv8GnPnRIw1g/gviz/tq?tqx=out:csv';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch data');

        const csvText = await response.text();
        const { data } = parseCsv(csvText);
        setCallData(data);
        calculateKpis(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const parseCsv = (csvText: string): { data: SemanticData[] } => {
    const lines = csvText.trim().split(/\r\n|\n|\r/).filter(Boolean);
    if (lines.length < 2) return { data: [] };

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const nameIdx = headers.findIndex(h => /name/i.test(h));
    const durationIdx = headers.findIndex(h => /duration/i.test(h));
    const reasonIdx = headers.findIndex(h => /diss?connection/i.test(h));

    const allRows = lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);
      return {
        Name: values[nameIdx]?.replace(/"/g, '').trim() || '',
        Duration: values[durationIdx]?.replace(/"/g, '').trim() || '',
        Dissconnection_reason: values[reasonIdx]?.replace(/"/g, '').trim() || '',
      };
    });

    const validRows = allRows.filter(
      row => row.Name && row.Duration && !isNaN(parseFloat(row.Duration))
    );

    // 🧠 Debug log
    console.log('📊 CSV Debug Info:');
    console.log('Total Rows (including blanks):', allRows.length);
    console.log('Valid Data Rows:', validRows.length);
    console.log('Skipped Empty/Invalid Rows:', allRows.length - validRows.length);

    return { data: validRows };
  };

  const calculateKpis = (data: SemanticData[]) => {
    const totalCalls = data.length;
    const durations = data
      .map(row => parseFloat(row.Duration))
      .filter(d => Number.isFinite(d));

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
    <div className="p-6">
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
                    {callData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.Name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Duration}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Dissconnection_reason}</td>
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
