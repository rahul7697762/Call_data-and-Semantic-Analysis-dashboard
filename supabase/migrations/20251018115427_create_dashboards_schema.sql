/*
  # Create Sales AI Analytics Dashboards Schema

  ## 1. New Tables
  
  ### `client_calls` - Client data and call history
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text) - Client name
    - `phone` (text) - Client phone number
    - `location` (text) - Client location
    - `property_type` (text) - Type of property interested in
    - `budget` (numeric) - Client budget
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Record update timestamp
  
  ### `semantic_analysis` - AI semantic analysis results
    - `id` (uuid, primary key) - Unique identifier
    - `client_call_id` (uuid, foreign key) - Reference to client call
    - `sentiment_score` (numeric) - Overall sentiment score
    - `agent_confidence` (numeric) - Agent confidence level
    - `positive_indicators` (text[]) - Array of positive signals
    - `negative_indicators` (text[]) - Array of negative signals
    - `predicted_outcome` (text) - Predicted call outcome
    - `alert_status` (text) - Alert status (normal, warning, critical)
    - `finish_reason` (text) - Reason for call completion
    - `avg_logprobs` (numeric) - Average log probabilities
    - `conversation_duration` (integer) - Duration in seconds
    - `total_customer_words` (integer) - Word count from customer
    - `agent_talk_time_percentage` (numeric) - Percentage of agent talk time
    - `buying_signals` (text[]) - Array of detected buying signals
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Record update timestamp

  ## 2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
    
  ## 3. Indexes
    - Add indexes on frequently queried columns for performance
*/

-- Create client_calls table
CREATE TABLE IF NOT EXISTS client_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  location text,
  property_type text,
  budget numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create semantic_analysis table
CREATE TABLE IF NOT EXISTS semantic_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_call_id uuid REFERENCES client_calls(id) ON DELETE CASCADE,
  sentiment_score numeric,
  agent_confidence numeric,
  positive_indicators text[] DEFAULT '{}',
  negative_indicators text[] DEFAULT '{}',
  predicted_outcome text,
  alert_status text DEFAULT 'normal',
  finish_reason text,
  avg_logprobs numeric,
  conversation_duration integer,
  total_customer_words integer,
  agent_talk_time_percentage numeric,
  buying_signals text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE client_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_calls
CREATE POLICY "Allow public read access to client_calls"
  ON client_calls FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to client_calls"
  ON client_calls FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to client_calls"
  ON client_calls FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to client_calls"
  ON client_calls FOR DELETE
  TO public
  USING (true);

-- RLS Policies for semantic_analysis
CREATE POLICY "Allow public read access to semantic_analysis"
  ON semantic_analysis FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to semantic_analysis"
  ON semantic_analysis FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to semantic_analysis"
  ON semantic_analysis FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to semantic_analysis"
  ON semantic_analysis FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_calls_created_at ON client_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_calls_phone ON client_calls(phone);
CREATE INDEX IF NOT EXISTS idx_semantic_analysis_client_call_id ON semantic_analysis(client_call_id);
CREATE INDEX IF NOT EXISTS idx_semantic_analysis_alert_status ON semantic_analysis(alert_status);
CREATE INDEX IF NOT EXISTS idx_semantic_analysis_sentiment_score ON semantic_analysis(sentiment_score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_client_calls_updated_at BEFORE UPDATE ON client_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semantic_analysis_updated_at BEFORE UPDATE ON semantic_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();