
export type CampaignCategory = 'tech' | 'health' | 'education' | 'environment' | 'social' | 'other';

export const categories: { label: string; value: CampaignCategory }[] = [
  { label: 'Technology', value: 'tech' },
  { label: 'Healthcare', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Environment', value: 'environment' },
  { label: 'Social Cause', value: 'social' },
  { label: 'Other', value: 'other' },
];
