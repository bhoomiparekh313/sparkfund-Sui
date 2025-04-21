
export interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  deadline: Date;
  amountCollected: number;
  image: string;
  owner: string;
  donators: string[];
  donations: number[];
  campaignType: 'startup' | 'donation';
  state: 'active' | 'successful' | 'failed' | 'closed';
  tiers: Tier[];
  approvers: string[];
  approvals: string[];
}

export interface Tier {
  name: string;
  amount: number;
  description: string;
}

export interface CampaignFormData {
  title: string;
  description: string;
  target: string; // Using string for form input, will be converted to number
  deadline: Date;
  image: string;
  campaignType: 'startup' | 'donation';
  tierNames: [string, string, string];
  tierAmounts: [string, string, string];
  tierDescriptions: [string, string, string];
  approvalThreshold: string; // Min contribution to be an approver
}

export interface UserProfile {
  address: string;
  role: 'creator' | 'contributor' | 'influencer';
  name: string;
  bio?: string;
  registeredAt: Date;
  campaignCount: number;
  contributionCount: number;
}

export interface InfluencerProfile {
  owner: string;
  name: string;
  description: string;
  specialties: string[];
  rate: number;
  forDonations: boolean;
  isActive: boolean;
}

export interface CampaignNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  campaignId: string;
}

export type UserRole = 'creator' | 'contributor' | 'influencer';
