export interface Database {
  public: {
    Tables: {
      call_history: {
        Row: {
          id: number;
          created_at: string;
          caller_number: string;
          recipient_number: string;
          call_duration: number | null;
          recording_url: string | null;
          transcript: string | null;
          tour_date: string | null;
          name: string;
          disconnection_reason: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          caller_number: string;
          recipient_number: string;
          call_duration?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          tour_date?: string | null;
          name: string;
          disconnection_reason?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          caller_number?: string;
          recipient_number?: string;
          call_duration?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          tour_date?: string | null;
          name?: string;
          disconnection_reason?: string | null;
        };
      };
      semantic_analysis: {
        Row: {
          id: string;
          client_call_id: string | null;
          sentiment_score: number | null;
          agent_confidence: number | null;
          positive_indicators: string[];
          negative_indicators: string[];
          predicted_outcome: string | null;
          alert_status: string;
          finish_reason: string | null;
          avg_logprobs: number | null;
          conversation_duration: number | null;
          total_customer_words: number | null;
          agent_talk_time_percentage: number | null;
          buying_signals: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_call_id?: string | null;
          sentiment_score?: number | null;
          agent_confidence?: number | null;
          positive_indicators?: string[];
          negative_indicators?: string[];
          predicted_outcome?: string | null;
          alert_status?: string;
          finish_reason?: string | null;
          avg_logprobs?: number | null;
          conversation_duration?: number | null;
          total_customer_words?: number | null;
          agent_talk_time_percentage?: number | null;
          buying_signals?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_call_id?: string | null;
          sentiment_score?: number | null;
          agent_confidence?: number | null;
          positive_indicators?: string[];
          negative_indicators?: string[];
          predicted_outcome?: string | null;
          alert_status?: string;
          finish_reason?: string | null;
          avg_logprobs?: number | null;
          conversation_duration?: number | null;
          total_customer_words?: number | null;
          agent_talk_time_percentage?: number | null;
          buying_signals?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
