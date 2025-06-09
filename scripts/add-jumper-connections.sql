-- Migration script to add jumper_connections column to existing training_data table
ALTER TABLE training_data ADD COLUMN IF NOT EXISTS jumper_connections JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have empty jumper connections array
UPDATE training_data 
SET jumper_connections = '[]'::jsonb 
WHERE jumper_connections IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'training_data' 
AND column_name = 'jumper_connections';
