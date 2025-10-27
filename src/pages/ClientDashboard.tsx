import React, { useState, useEffect, useMemo } from "react";
import { Phone, MapPin, Home, Search, Filter, Download, TrendingUp, DollarSign, Users, ArrowUpDown, Calendar } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// Define the structure of a client call object
type ClientCall = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  location: string | null;
  property_type: string | null;
  budget: number | null;
};

// Main component
export default function ClientDashboard() {
  const [clients, setClients] = useState<ClientCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof ClientCall | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchClientsFromGoogleSheet = async () => {
      const SHEET_ID = "1Nz0fefTDxNPqABTnDe8qkNgjbm3uz6jW7nV6RGRsEM4";
      const SHEET_NAME = "Sheet1";
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        const text = await response.text();
        const jsonString = text.match(/\((.*)\)/)?.[1];
        if (!jsonString) throw new Error("Failed to parse JSONP response.");

        const data = JSON.parse(jsonString);
        const headers = data.table.cols.map((col: { label: string }) =>
          col.label.toLowerCase().replace(/\s+/g, "_")
        );
        const rows = data.table.rows;

        const formattedClients: ClientCall[] = rows
          .map((row: { c: ({ v: any } | null)[] }, index: number) => {
            const client: any = {};
            headers.forEach((header: string, i: number) => {
              const cell = row.c[i];
              const value = cell ? cell.v : null;

              // Budget
              if (header === "budget" && typeof value === "number") {
                client.budget = value;
              }
              // Default field assignment
              else {
                client[header] = value;
              }
            });

            client.id = client.id || index;
            return client as ClientCall;
          })
          .sort(
            (a: ClientCall, b: ClientCall) =>
              new Date(b.created_at ?? 0).getTime() -
              new Date(a.created_at ?? 0).getTime()
          );

        setClients(formattedClients);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(
          "Failed to load client data. Please check the Google Sheet link and permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClientsFromGoogleSheet();
    
  }, []);

  // Filter and sort logic
  const filteredClients = useMemo(() => {
    let filtered = clients.filter((client) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        client.name?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(searchTerm) ||
        client.location?.toLowerCase().includes(searchLower);
      const matchesFilter =
        filterType === "all" || client.property_type === filterType;
      return matchesSearch && matchesFilter;
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
  }, [clients, searchTerm, filterType, sortField, sortDirection]);

  // Unique property types
  const propertyTypes = [
    ...new Set(clients.map((c) => c.property_type).filter(Boolean)),
  ];

  // Enhanced Stats
  const stats = useMemo(() => {
    const validBudgets = clients.filter(c => c.budget).map(c => c.budget!);
    const avgBudget = validBudgets.length > 0 
      ? validBudgets.reduce((sum, b) => sum + b, 0) / validBudgets.length 
      : 0;
    const maxBudget = validBudgets.length > 0 ? Math.max(...validBudgets) : 0;
    
    return {
      total: clients.length,
      locations: new Set(clients.map((c) => c.location).filter(Boolean)).size,
      avgBudget,
      maxBudget,
      filtered: filteredClients.length,
    };
  }, [clients, filteredClients]);

  // Chart data
  const propertyTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    clients.forEach(c => {
      if (c.property_type) {
        counts[c.property_type] = (counts[c.property_type] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    clients.forEach(c => {
      if (c.location) {
        counts[c.location] = (counts[c.location] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [clients]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#f97316'];

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Phone', 'Location', 'Property Type', 'Budget', 'Created At'],
      ...filteredClients.map(c => [
        c.name || '',
        c.phone || '',
        c.location || '',
        c.property_type || '',
        c.budget?.toString() || '',
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
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
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
            title="Total Clients"
            value={stats.total.toString()}
            subtitle={`${stats.filtered} shown`}
            color="blue"
          />
          <StatCard
            icon={MapPin}
            title="Unique Locations"
            value={stats.locations.toString()}
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            title="Avg Budget"
            value={`₹${(stats.avgBudget / 100000).toFixed(1)}L`}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Max Budget"
            value={`₹${(stats.maxBudget / 100000).toFixed(1)}L`}
            color="orange"
          />
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Type Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Locations</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition"
              >
                <option value="all">All Property Types</option>
                {propertyTypes.map(
                  (type) => type && <option key={type}>{type}</option>
                )}
              </select>
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
                    Phone
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('property_type')}
                  >
                    <div className="flex items-center gap-1">
                      Property Type
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('budget')}
                  >
                    <div className="flex items-center gap-1">
                      Budget
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
                      colSpan={6}
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
                        {client.phone}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {client.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            {client.location}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {client.property_type ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            <Home className="w-3 h-3" />
                            {client.property_type}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {client.budget ? (
                          <span className="flex items-center gap-1.5 text-green-700">
                            <span className="text-green-500">₹</span>
                            {client.budget.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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

// StatCard component
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
}) => {
  const colors = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
  };
  const colorClasses = colors[color as keyof typeof colors] || colors.blue;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 ${colorClasses.bg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${colorClasses.text}`} />
        </div>
      </div>
    </div>
  );
};
