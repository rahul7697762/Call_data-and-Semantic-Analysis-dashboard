import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Phone, User } from 'lucide-react';

interface Meeting {
  id: number;
  name: string;
  tour_date: string;
  caller_number: string;
}

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from('call_history')
        .select('id, name, tour_date, caller_number')
        .not('tour_date', 'is', null)
        .order('tour_date', { ascending: true });

      if (error) {
        console.error('Error fetching meetings:', error);
        setError('Failed to load meetings.');
      } else {
        setMeetings(data as Meeting[]);
      }
      setLoading(false);
    };

    fetchMeetings();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upcoming Tours & Meetings</h1>
      {loading && <p>Loading meetings...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="space-y-4">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <p className="text-lg font-semibold text-gray-800">{meeting.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <p className="text-gray-600">{new Date(meeting.tour_date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-600">{meeting.caller_number}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No upcoming meetings found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Meetings;