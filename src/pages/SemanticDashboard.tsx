import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Settings,
  Phone,
  Mic,
  Bell,
  MessageSquare,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';



interface SemanticData {
  [key: string]: string;
}

const SemanticCard = ({ data, headers }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {headers.map((header) => (
                    <div key={header}>
                        <p className="text-sm font-medium text-gray-500">{header.replace(/_/g, ' ')}</p>
                        <p className="text-lg font-semibold text-gray-800">{data[header]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RangeFilter = ({ title, min, max, step, value, onChange }) => {
    return (
        <div>
            <label className="text-sm font-medium text-gray-700">{title}</label>
            <div className="flex items-center space-x-4">
                <span>{min}</span>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full"
                />
                <span>{max}</span>
            </div>
            <div className="text-center">{value}</div>
        </div>
    )
}

const SemanticDashboard = () => {
  
  const [data, setData] = useState<SemanticData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentScore, setSentimentScore] = useState(0);
  const [agentConfidence, setAgentConfidence] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/17p_gFOSGYxXt1i9qM3W1BIG5VZdBxjxUrx5Fi_MiLnY/gviz/tq?tqx=out:csv');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const csvText = await response.text();
        const { data, headers } = parseCsv(csvText);
        setData(data);
        setHeaders(headers);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const parseCsv = (csvText: string): { data: SemanticData[], headers: string[] } => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return headers.reduce((obj, header, index) => {
            const value = values[index] || '';
            obj[header] = value.replace(/"/g, '').trim();
            return obj;
        }, {} as SemanticData);
    });
    return { data, headers };
  };

  const sentimentScores = data.map(row => parseFloat(row.sentiment_score)).filter(score => !isNaN(score));
  const minSentimentScore = sentimentScores.length > 0 ? Math.min(...sentimentScores) : 0;
  const maxSentimentScore = sentimentScores.length > 0 ? Math.max(...sentimentScores) : 1;

  const agentConfidences = data.map(row => parseFloat(row.agent_confidence)).filter(conf => !isNaN(conf));
  const minAgentConfidence = agentConfidences.length > 0 ? Math.min(...agentConfidences) : 0;
  const maxAgentConfidence = agentConfidences.length > 0 ? Math.max(...agentConfidences) : 10;

  const filteredData = data.filter((row) => {
    const searchFilter = Object.values(row).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sentimentScoreFilter = row.sentiment_score ? parseFloat(row.sentiment_score) >= sentimentScore : true;
    const agentConfidenceFilter = row.agent_confidence ? parseFloat(row.agent_confidence) >= agentConfidence : true;

    return searchFilter && sentimentScoreFilter && agentConfidenceFilter;
  });

  const outcomeData = data.reduce((acc, row) => {
    const outcome = row.predicted_outcome;
    if (outcome) {
      acc[outcome] = (acc[outcome] || 0) + 1;
    }
    return acc;
  }, {});

  const outcomeChartData = Object.keys(outcomeData).map(key => ({ name: key, value: outcomeData[key] }));

  const alertData = data.reduce((acc, row) => {
    const alert = row['Alert Status'];
    if (alert) {
      acc[alert] = (acc[alert] || 0) + 1;
    }
    return acc;
  }, {});

  const alertChartData = Object.keys(alertData).map(key => ({ name: key, value: alertData[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-screen bg-gray-100">
      <main className="p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Semantic Analysis</h1>
            <p className="text-gray-500">Analysis of call data from Google Sheet</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search data..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {error ? (
            <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <RangeFilter title="Sentiment Score" min={minSentimentScore} max={maxSentimentScore} step={0.1} value={sentimentScore} onChange={setSentimentScore} />
                <RangeFilter title="Agent Confidence" min={minAgentConfidence} max={maxAgentConfidence} step={0.5} value={agentConfidence} onChange={setAgentConfidence} />
            </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
                        <SemanticCard key={index} data={row} headers={headers} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500">
                        {data.length > 0 ? 'No results found.' : 'Loading data...'}
                    </div>
                )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SemanticDashboard;