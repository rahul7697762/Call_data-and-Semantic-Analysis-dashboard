import React, { useState, useEffect, useMemo } from "react";
import { Phone, Search, Download, Users, ArrowUpDown, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";
import StatCard from "../components/StatCard";

// Define the structure of a client call object
type ClientCall = {
  id: number;
  created_at: string;
  caller_number: string;
  recipient_number: string;
  call_duration: number | null;
  recording_url: string | null;
  transcript: string | null;
  tour_date: string | null;
  name: string;
};

// Main component
export default function ClientDashboard() {
  const [clients, setClients] = useState<ClientCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ClientCall | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('call_history').select('*');

      if (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to load client data. Please check your Supabase connection.");
      } else {
        setClients(data as ClientCall[]);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  // Filter and sort logic
  const filteredClients = useMemo(() => {
    let filtered = clients.filter((client) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name?.toLowerCase().includes(searchLower) ||
        client.caller_number?.includes(searchTerm)
      );
    });

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        
        let comparison = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [clients, searchTerm, sortField, sortDirection]);

  // Enhanced Stats
  const stats = useMemo(() => {
    return {
      total: clients.length,
      filtered: filteredClients.length,
    };
  }, [clients, filteredClients]);

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Caller Number', 'Recipient Number', 'Call Duration', 'Tour Date', 'Created At'],
      ...filteredClients.map(c => [
        c.name || '',
        c.caller_number || '',
        c.recipient_number || '',
        c.call_duration?.toString() || '',
        c.tour_date || '',
        c.created_at || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSort = (field: keyof ClientCall) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading Client Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">
        <div className="text-center p-8 border border-red-200 rounded-lg bg-white shadow-md">
          <h2 className="text-xl font-bold mb-2">An Error Occurred</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Client Dashboard</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Calls"
            value={stats.total.toString()}
            subtitle={`${stats.filtered} shown`}
            color="blue"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Caller Number
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('tour_date')}
                  >
                    <div className="flex items-center gap-1">
                      Tour Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('call_duration')}
                  >
                    <div className="flex items-center gap-1">
                      Call Duration (s)
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No clients found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {client.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {client.caller_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {client.tour_date ? (
                          new Date(client.tour_date).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {client.call_duration}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {client.created_at ? (
                          new Date(client.created_at).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}