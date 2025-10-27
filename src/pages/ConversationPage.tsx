import React, { useState, useEffect } from 'react';

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
        const response = await fetch('https://docs.google.com/spreadsheets/d/1qRyEXBZZbz8SSJs3Cd8yzFlDWkud4Cdmv8GnPnRIw1g/gviz/tq?tqx=out:csv');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const csvText = await response.text();
        const parsedData = parseCsv(csvText);
        setConversation(parsedData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const parseCsv = (csvText: string): ConversationLine[] => {
    const lines = csvText.trim().split('\n').slice(1); // Skip header row
    return lines.map(line => {
      const values = line.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);
      return {
        speaker: values[0]?.replace(/\"/g, '').trim() || '',
        line: values[1]?.replace(/\"/g, '').trim() || ''
      };
    });
  };

  return (
    <div className="p-4">
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