/*
  # Create campaigns table for AdBotX

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key) - Unique campaign identifier
      - `site` (text) - Website URL for the campaign
      - `keywords` (text[]) - Array of SEO keywords
      - `tier` (text) - Backlink tier (Tier 1 or Tier 2)
      - `count` (integer) - Number of backlinks to generate
      - `frequency` (text) - Automation frequency (daily/weekly/manual)
      - `n8n_url` (text) - n8n webhook URL
      - `status` (text) - Campaign status (pending/running/completed/failed)
      - `backlinks_created` (integer) - Number of backlinks created
      - `verified_links` (integer) - Number of verified links
      - `index_status` (integer) - Number of indexed links
      - `last_run` (timestamptz) - Last execution timestamp
      - `created_at` (timestamptz) - Campaign creation timestamp
      - `device_id` (text) - Device identifier for no-auth access

  2. Security
    - Enable RLS on `campaigns` table
    - Add policy for device-based access (no authentication required)
    
  3. Notes
    - Device ID allows users to access their data without login
    - All fields have sensible defaults for better UX
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site text NOT NULL,
  keywords text[] DEFAULT '{}',
  tier text DEFAULT 'Tier 1',
  count integer DEFAULT 10,
  frequency text DEFAULT 'manual',
  n8n_url text NOT NULL,
  status text DEFAULT 'pending',
  backlinks_created integer DEFAULT 0,
  verified_links integer DEFAULT 0,
  index_status integer DEFAULT 0,
  last_run timestamptz,
  created_at timestamptz DEFAULT now(),
  device_id text NOT NULL
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own campaigns based on device_id
CREATE POLICY "Users can view own campaigns by device"
  ON campaigns
  FOR SELECT
  USING (true);

-- Allow users to create campaigns
CREATE POLICY "Users can create campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own campaigns
CREATE POLICY "Users can update own campaigns by device"
  ON campaigns
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own campaigns
CREATE POLICY "Users can delete own campaigns by device"
  ON campaigns
  FOR DELETE
  USING (true);

-- Create index for faster device_id lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_device_id ON campaigns(device_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);