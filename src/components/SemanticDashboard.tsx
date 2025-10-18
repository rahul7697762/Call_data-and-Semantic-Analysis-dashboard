import { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MessageSquare,
  Target,
  Brain,
  Activity
} from 'lucide-react';

// Define the structure of our analysis data
interface AnalysisWithClient {
  id: string;
  created_at: string;
  call_id: string;
  sentiment_score: number | null;
  agent_confidence: number | null;
  conversation_duration: number | null;
  alert_status: string;
  total_customer_words: number | null;
  agent_talk_time_percentage: number | null;
  predicted_outcome: string | null;
  positive_indicators: string[];
  negative_indicators: string[];
  buying_signals: string[];
  client_calls?: {
    name: string;
    phone: string;
  } | null;
}

export default function App() {
  const [analyses, setAnalyses] = useState<AnalysisWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch and parse data from the Google Sheet
    const fetchAnalysesFromSheet = async () => {
      // The ID of your Google Sheet
      const SHEET_ID = '17p_gFOSGYxXt1i9qM3W1BIG5VZdBxjxUrx5Fi_MiLnY';
      // The GID of the specific sheet (0 is usually the first sheet)
      const GID = '0';
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setAnalyses(parsedData);
      } catch (err) {
        console.error('Error fetching or parsing sheet data:', err);
        setError('Failed to load data from the spreadsheet.');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to parse CSV text into our desired data structure
    const parseCSV = (text: string): AnalysisWithClient[] => {
      const rows = text.split(/\r?\n/).map(row => row.split(','));
      const header = rows[0];
      const dataRows = rows.slice(1);

      return dataRows.map(row => {
        const rowData: { [key: string]: any } = {};
        header.forEach((key, index) => {
          rowData[key.trim()] = row[index] ? row[index].trim() : '';
        });

        // Map and transform the raw CSV data into the AnalysisWithClient structure
        return {
          id: rowData.id,
          created_at: rowData.created_at,
          call_id: rowData.call_id,
          sentiment_score: rowData.sentiment_score ? parseFloat(rowData.sentiment_score) : null,
          agent_confidence: rowData.agent_confidence ? parseFloat(rowData.agent_confidence) : null,
          conversation_duration: rowData.conversation_duration ? parseInt(rowData.conversation_duration, 10) : null,
          alert_status: rowData.alert_status,
          total_customer_words: rowData.total_customer_words ? parseInt(rowData.total_customer_words, 10) : null,
          agent_talk_time_percentage: rowData.agent_talk_time_percentage ? parseFloat(rowData.agent_talk_time_percentage) : null,
          predicted_outcome: rowData.predicted_outcome || null,
          // Split comma-separated strings into arrays
          positive_indicators: rowData.positive_indicators ? rowData.positive_indicators.split(';').map((s: string) => s.trim()) : [],
          negative_indicators: rowData.negative_indicators ? rowData.negative_indicators.split(';').map((s: string) => s.trim()) : [],
          buying_signals: rowData.buying_signals ? rowData.buying_signals.split(';').map((s: string) => s.trim()) : [],
          client_calls: {
            name: rowData.client_name,
            phone: rowData.client_phone,
          },
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by creation date
    };

    fetchAnalysesFromSheet();
  }, []);

  // Calculate overall statistics from the fetched data
  const stats = {
    avgSentiment: analyses.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / (analyses.length || 1),
    avgConfidence: analyses.reduce((sum, a) => sum + (a.agent_confidence || 0), 0) / (analyses.length || 1),
    alertCount: analyses.filter(a => a.alert_status === 'critical' || a.alert_status === 'warning').length,
    avgDuration: analyses.reduce((sum, a) => sum + (a.conversation_duration || 0), 0) / (analyses.length || 1),
    positiveCalls: analyses.filter(a => (a.sentiment_score || 0) > 0.6).length,
    buyingSignalsTotal: analyses.reduce((sum, a) => sum + (a.buying_signals?.length || 0), 0),
  };

  // Helper functions for styling based on data values
  const getAlertBadge = (status: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      normal: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status as keyof typeof colors] || colors.normal;
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold">An Error Occurred</h2>
            <p>{error}</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Semantic Analysis Dashboard</h1>
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                            <p className={`text-3xl font-bold mt-2 ${getSentimentColor(stats.avgSentiment)}`}>
                                {(stats.avgSentiment * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Agent Confidence</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {(stats.avgConfidence * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Target className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{stats.alertCount}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {Math.round(stats.avgDuration / 60)}m
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Positive Calls</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.positiveCalls}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ThumbsUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Buying Signals</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.buyingSignalsTotal}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Analysis</h2>
                <div className="space-y-4">
                    {analyses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No analysis data available
                        </div>
                    ) : (
                        analyses.map((analysis) => (
                            <div
                                key={analysis.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-y-2 mb-3">
                                    <div className="flex-1 min-w-[200px]">
                                        {analysis.client_calls && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900">{analysis.client_calls.name}</h3>
                                                <span className="text-sm text-gray-500">{analysis.client_calls.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center flex-wrap gap-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertBadge(analysis.alert_status)}`}>
                                                {analysis.alert_status}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(analysis.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${getSentimentColor(analysis.sentiment_score || 0)}`}>
                                            {((analysis.sentiment_score || 0) * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-xs text-gray-500">sentiment</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Confidence</div>
                                            <div className="text-sm font-medium">{((analysis.agent_confidence || 0) * 100).toFixed(0)}%</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Duration</div>
                                            <div className="text-sm font-medium">{Math.round((analysis.conversation_duration || 0) / 60)}m</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Words</div>
                                            <div className="text-sm font-medium">{analysis.total_customer_words || 0}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Agent Talk</div>
                                            <div className="text-sm font-medium">{((analysis.agent_talk_time_percentage || 0) * 100).toFixed(0)}%</div>
                                        </div>
                                    </div>
                                </div>
                                {analysis.predicted_outcome && (
                                    <div className="mb-3">
                                        <span className="text-xs font-medium text-gray-700">Predicted Outcome: </span>
                                        <span className="text-xs text-gray-600">{analysis.predicted_outcome}</span>
                                    </div>
                                )}
                                <div className="grid md:grid-cols-2 gap-3">
                                    {analysis.positive_indicators && analysis.positive_indicators.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-medium text-gray-700">Positive Indicators</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {analysis.positive_indicators.map((indicator, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                                        {indicator}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {analysis.negative_indicators && analysis.negative_indicators.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <ThumbsDown className="w-4 h-4 text-red-600" />
                                                <span className="text-xs font-medium text-gray-700">Negative Indicators</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {analysis.negative_indicators.map((indicator, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                                                        {indicator}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {analysis.buying_signals && analysis.buying_signals.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1 mb-1">
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-medium text-gray-700">Buying Signals</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {analysis.buying_signals.map((signal, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                    {signal}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
    </div>
  );
}