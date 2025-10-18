import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Home, DollarSign, Search, Filter } from 'lucide-react';

// Define the structure of a client call object, matching the Google Sheet columns
type ClientCall = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  location: string | null;
  property_type: string | null;
  budget: number | null;
};

// Main component for the client dashboard
export default function ClientDashboard() {
  const [clients, setClients] = useState<ClientCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // This function fetches and processes data from the public Google Sheet.
    const fetchClientsFromGoogleSheet = async () => {
      // The ID of your Google Sheet
      const SHEET_ID = '1Nz0fefTDxNPqABTnDe8qkNgjbm3uz6jW7nV6RGRsEM4';
      // The name of the specific sheet/tab
      const SHEET_NAME = 'Sheet1';
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let text = await response.text();
        
        // The response is JSONP, so we need to extract the JSON part.
        const jsonString = text.match(/\((.*)\)/)?.[1];
        if (!jsonString) {
          throw new Error('Failed to parse JSONP response from Google Sheets.');
        }

        const data = JSON.parse(jsonString);
        
        // Extract headers and rows from the parsed data
        const headers = data.table.cols.map((col: { label: string }) => col.label.toLowerCase().replace(/\s+/g, '_'));
        const rows = data.table.rows;

        // Map the rows to our ClientCall object structure
        const formattedClients: ClientCall[] = rows.map((row: { c: ({ v: any } | null)[] }, index: number) => {
          const client: any = {};
          headers.forEach((header: string, i: number) => {
            const cell = row.c[i];
            let value = cell ? cell.v : null;
            // Handle specific data types
            if (header === 'budget' && typeof value === 'number') {
                client[header] = value;
            } else if (header === 'created_at' && value) {
                // Format date string correctly if necessary
                client[header] = value.replace('Date(', '').replace(')','');
            } else {
                client[header] = value;
            }
          });
          // Ensure there's a unique ID
          client.id = client.id || index; 
          return client as ClientCall;
        }).sort((a: ClientCall, b: ClientCall) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by most recent

        setClients(formattedClients);
      } catch (err) {
        console.error('Error fetching clients from Google Sheet:', err);
        setError('Failed to load client data. Please check the Google Sheet link and permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientsFromGoogleSheet();
  }, []);

  // Filter clients based on search term and property type
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      client.name?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm) ||
      client.location?.toLowerCase().includes(searchLower);

    const matchesFilter = filterType === 'all' || client.property_type === filterType;

    return matchesSearch && matchesFilter;
  });

  // Get unique property types for the filter dropdown
  const propertyTypes = [...new Set(clients.map(c => c.property_type).filter(Boolean))];

  // Calculate statistics for the dashboard header
  const stats = {
    total: clients.length,
    avgBudget: clients.reduce((sum, c) => sum + (c.budget || 0), 0) / (clients.filter(c => c.budget).length || 1),
    locations: new Set(clients.map(c => c.location).filter(Boolean)).size,
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
        <h1 className="text-3xl font-bold text-gray-800">Client Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Phone} title="Total Clients" value={stats.total.toString()} color="blue" />
          <StatCard icon={DollarSign} title="Avg. Budget" value={`$${stats.avgBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="green" />
          <StatCard icon={MapPin} title="Unique Locations" value={stats.locations.toString()} color="purple" />
        </div>

        {/* Filter and Table Section */}
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
                {propertyTypes.map(type => (
                  type && <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Property Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No clients found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{client.name}</td>
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
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {client.property_type ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            <Home className="w-3 h-3" />
                            {client.property_type}
                          </span>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {client.budget ? (
                          <span className="flex items-center gap-1.5 text-green-700">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            {client.budget.toLocaleString()}
                          </span>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString()}
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

// A reusable StatCard component for the dashboard header
const StatCard = ({ icon: Icon, title, value, color }: {icon: React.ElementType, title: string, value: string, color: string}) => {
    const colors = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600'},
        green: { bg: 'bg-green-100', text: 'text-green-600'},
        purple: { bg: 'bg-purple-100', text: 'text-purple-600'},
    }
    const colorClasses = colors[color as keyof typeof colors] || colors.blue;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 ${colorClasses.bg} rounded-lg`}>
              <Icon className={`w-6 h-6 ${colorClasses.text}`} />
            </div>
          </div>
        </div>
    )
}

