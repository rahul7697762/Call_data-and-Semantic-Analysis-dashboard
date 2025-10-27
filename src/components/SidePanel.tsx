import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, MessageSquare, Users, Settings, Phone, Bell, Search, PieChart, Sliders } from 'lucide-react';

const SidePanel: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">VoiceAgent</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/overview" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <PieChart className="w-5 h-5" />
          <span>Ai voice Agent Overview</span>
        </Link>
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <BarChart3 className="w-5 h-5" />
          <span>Semantic Dashboard</span>
        </Link>
        <Link to="/conversations" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <MessageSquare className="w-5 h-5" />
          <span>Conversations</span>
        </Link>
        <Link to="/meetings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <Users className="w-5 h-5" />
          <span>Meetings</span>
        </Link>
        {/* <Link to="/reminders" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <Bell className="w-5 h-5" />
          <span>Reminders</span>
        </Link>
        <Link to="/enquiries" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <Search className="w-5 h-5" />
          <span>Enquiries</span>
        </Link>
        <Link to="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
          <PieChart className="w-5 h-5" />
          <span>Analytics</span>
        </Link> */}
        {/* <div>
          <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
          <div className="space-y-2">
            <Link to="/settings/voice" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <Phone className="w-5 h-5" />
              <span>Voice Settings</span>
            </Link>
            <Link to="/settings/call" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <Settings className="w-5 h-5" />
              <span>Call Settings</span>
            </Link>
            <Link to="/settings/system" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <Sliders className="w-5 h-5" />
              <span>System Settings</span>
            </Link>
          </div>
        </div> */}
      </nav>
    </div>
  );
};

export default SidePanel;
