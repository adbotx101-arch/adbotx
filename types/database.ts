export interface Campaign {
  id: string;
  site: string;
  keywords: string[];
  tier: string;
  count: number;
  frequency: string;
  n8n_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  backlinks_created: number;
  verified_links: number;
  index_status: number;
  last_run: string | null;
  created_at: string;
  device_id: string;
}

export interface CampaignInsert {
  site: string;
  keywords: string[];
  tier: string;
  count: number;
  frequency: string;
  n8n_url: string;
  device_id: string;
}

export interface CampaignUpdate {
  status?: 'pending' | 'running' | 'completed' | 'failed';
  backlinks_created?: number;
  verified_links?: number;
  index_status?: number;
  last_run?: string;
}
