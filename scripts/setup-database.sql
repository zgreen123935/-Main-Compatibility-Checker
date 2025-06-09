-- Create training_data table
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_hash TEXT NOT NULL,
  image_url TEXT NOT NULL,
  user_verified_connections JSONB NOT NULL,
  ai_detected_connections JSONB NOT NULL,
  system_type TEXT NOT NULL,
  thermostat_brand TEXT,
  thermostat_model TEXT,
  image_quality TEXT NOT NULL,
  user_feedback TEXT,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  correction_type TEXT,
  confidence_score FLOAT,
  metadata JSONB
);

-- Create index on image_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_training_data_image_hash ON training_data(image_hash);

-- Create similar_configurations table for faster similarity lookups
CREATE TABLE IF NOT EXISTS similar_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  configuration_hash TEXT NOT NULL UNIQUE,
  terminals TEXT[] NOT NULL,
  system_type TEXT NOT NULL,
  training_data_ids UUID[] NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  metadata JSONB
);

-- Create index on terminals array for similarity searches
CREATE INDEX IF NOT EXISTS idx_similar_configurations_terminals ON similar_configurations USING gin(terminals);
