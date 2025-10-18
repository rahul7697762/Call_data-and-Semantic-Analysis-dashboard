export interface Database {
  public: {
    Tables: {
      client_calls: {
        Row: {
          id: string;
          name: string;
          phone: string;
          location: string | null;
          property_type: string | null;
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          location?: string | null;
          property_type?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          location?: string | null;
          property_type?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
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
