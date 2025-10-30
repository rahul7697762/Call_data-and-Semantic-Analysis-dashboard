import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase";

interface ConversationLine {
  speaker: string;
  line: string;
}

const ConversationPage: React.FC = () => {
  const [conversation, setConversation] = useState<ConversationLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Get the call ID from the URL or props
        // For now, fetching the first call's transcript
        const { data, error } = await supabase
          .from('call_history')
          .select('transcript')
          .limit(1)
          .single();

        if (error) {
          throw error;
        }

        if (data && data.transcript) {
          const parsedData = parseTranscript(data.transcript);
          setConversation(parsedData);
        }
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const parseTranscript = (transcript: string): ConversationLine[] => {
    const lines = transcript.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(':');
      const speaker = parts[0]?.trim() || '';
      const lineText = parts.slice(1).join(':').trim() || '';
      return { speaker, line: lineText };
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Conversation Details</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Conversation Transcript</h2>
        {error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="prose max-w-none">
            {conversation.length > 0 ? (
              conversation.map((line, index) => (
                <p key={index}><strong>{line.speaker}:</strong> {line.line}</p>
              ))
            ) : (
              <p>Loading conversation...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
