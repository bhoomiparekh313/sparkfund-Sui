import { DEPLOYED_CONTRACTS } from '@/config/contracts';
import { provider, getObject, getObjects } from './sui-client';
import type { Campaign, CampaignFormData, CampaignNotification, UserProfile, InfluencerProfile, Tier, UserRole } from '@/types/Campaign';

// Type definitions for blockchain data
export interface BlockchainCampaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  deadline: number; // Unix timestamp in milliseconds
  amountRaised: number;
  campaignType: number; // 0: startup, 1: donation
  state: number; // 0: active, 1: successful, 2: failed, 3: closed
  owner: string;
  balance: number;
  tiers: BlockchainTier[];
  contributors: string[];
  contributions: number[];
  approvers: string[];
  approvals: string[];
  approvalThreshold: number;
}

export interface BlockchainTier {
  name: string;
  amount: number;
  description: string;
}

// Enhanced blockchain error handling
export interface BlockchainResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: number;
}

// Convert blockchain campaign to frontend model
function convertBlockchainCampaign(bc: BlockchainCampaign): Campaign {
  // Convert campaign state from number to string
  let state: 'active' | 'successful' | 'failed' | 'closed';
  switch (bc.state) {
    case 0:
      state = 'active';
      break;
    case 1:
      state = 'successful';
      break;
    case 2:
      state = 'failed';
      break;
    case 3:
      state = 'closed';
      break;
    default:
      state = 'active';
  }

  // Convert campaign type from number to string
  const campaignType = bc.campaignType === 0 ? 'startup' : 'donation';
  
  return {
    id: bc.id,
    title: bc.title,
    description: bc.description,
    target: bc.targetAmount,
    deadline: new Date(bc.deadline),
    amountCollected: bc.amountRaised,
    image: bc.imageUrl,
    owner: bc.owner,
    donators: bc.contributors,
    donations: bc.contributions,
    campaignType,
    state,
    tiers: bc.tiers,
    approvers: bc.approvers,
    approvals: bc.approvals,
  };
}

// Create a campaign using the deployed contract
export const createCampaign = async (formData: CampaignFormData): Promise<BlockchainResult<string>> => {
  try {
    console.log(`Creating campaign: ${formData.title} with target ${formData.target}`);
    
    if (!window.suiWallet) {
      throw new Error('Sui wallet not connected');
    }

    const moveCallTx = {
      target: `${DEPLOYED_CONTRACTS.PACKAGE_ID}::campaign::create_campaign`,
      arguments: [
        formData.title,
        formData.description,
        formData.image,
        BigInt(parseFloat(formData.target) * 1e9), // Convert to MIST
        Math.floor(formData.deadline.getTime() / 1000), // Unix timestamp
        formData.campaignType === 'startup' ? 0 : 1,
        formData.tierNames,
        formData.tierAmounts.map(amount => BigInt(parseFloat(amount) * 1e9)),
        formData.tierDescriptions,
      ],
    };

    const result = await window.suiWallet.signAndExecuteTransaction({
      transactionBlock: moveCallTx,
    });

    return {
      success: true,
      data: result.digest
    };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating campaign"
    };
  }
};

// Get all featured campaigns
export const getFeaturedCampaigns = async (): Promise<BlockchainResult<Campaign[]>> => {
  try {
    const featuredObject = await getObject(DEPLOYED_CONTRACTS.FEATURED_CAMPAIGNS_ID);
    if (!featuredObject.data) {
      throw new Error('Featured campaigns object not found');
    }

    const campaignIds = featuredObject.data.content.fields.campaigns;
    const campaigns = await getObjects(campaignIds);

    return {
      success: true,
      data: campaigns.map(convertBlockchainCampaign)
    };
  } catch (error) {
    console.error("Error getting featured campaigns:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting featured campaigns"
    };
  }
};

// Donate to a campaign with enhanced error handling
export const donateToCampaign = async (
  campaignId: string, 
  amount: number,
  tierIndex: number
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Donating ${amount} SUI to campaign ${campaignId} for tier ${tierIndex}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign.contribute entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error donating to campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error donating to campaign"
    };
  }
};

// Approve withdrawal for a campaign with enhanced error handling
export const approveWithdrawal = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Approving withdrawal for campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign.approve_withdrawal entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error approving withdrawal"
    };
  }
};

// Withdraw funds from a campaign with enhanced error handling
export const withdrawFunds = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Withdrawing funds from campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign.withdraw_funds entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error withdrawing funds"
    };
  }
};

// Check campaign status with enhanced error handling
export const checkCampaignStatus = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Checking status for campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign.check_status entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error checking campaign status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking campaign status"
    };
  }
};

// Request refund from campaign with enhanced error handling
export const requestRefund = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Requesting refund from campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign.refund entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error requesting refund:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error requesting refund"
    };
  }
};

// Emergency stop for campaign with enhanced error handling
export const emergencyStopCampaign = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Emergency stopping campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign.emergency_stop entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error emergency stopping campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error emergency stopping campaign"
    };
  }
};

// Register a user with enhanced error handling
export const registerUser = async (
  role: UserRole,
  name: string,
  bio: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Registering user as ${role} with name ${name}`);
    
    // Convert role to number
    let roleCode: number;
    switch (role) {
      case 'creator':
        roleCode = 0;
        break;
      case 'contributor':
        roleCode = 1;
        break;
      case 'influencer':
        roleCode = 2;
        break;
      default:
        roleCode = 1; // Default to contributor
    }
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign_factory.register_user entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error registering user"
    };
  }
};

// Create influencer profile with enhanced error handling
export const createInfluencerProfile = async (
  name: string,
  description: string,
  specialties: string[],
  rate: number,
  forDonations: boolean
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Creating influencer profile for ${name} with rate ${rate}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign_factory.create_influencer_profile entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error creating influencer profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating influencer profile"
    };
  }
};

// Start influencer campaign with enhanced error handling
export const startInfluencerCampaign = async (
  campaignId: string,
  influencerAddress: string,
  isPaid: boolean
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Starting influencer campaign for ${campaignId} with influencer ${influencerAddress}, paid: ${isPaid}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign_factory.start_influencer_campaign entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error starting influencer campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error starting influencer campaign"
    };
  }
};

// Subscribe to campaign with enhanced error handling
export const subscribeToCampaign = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Subscribing to campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign_factory.subscribe_to_campaign entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error subscribing to campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error subscribing to campaign"
    };
  }
};

// Unsubscribe from campaign with enhanced error handling
export const unsubscribeFromCampaign = async (
  campaignId: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Unsubscribing from campaign ${campaignId}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign_factory.unsubscribe_from_campaign entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error unsubscribing from campaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error unsubscribing from campaign"
    };
  }
};

// Create campaign notification with enhanced error handling
export const createCampaignNotification = async (
  campaignId: string,
  title: string,
  message: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Creating notification for campaign ${campaignId}: ${title}`);
    
    // In a real implementation, this would call the Move smart contract
    // Using the campaign_factory.create_campaign_notification entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error creating campaign notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating campaign notification"
    };
  }
};

// Get campaign details with enhanced error handling
export const getCampaignDetails = async (
  campaignId: string
): Promise<BlockchainResult<Campaign>> => {
  try {
    console.log(`Getting details for campaign ${campaignId}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation returning a sample campaign
    const mockCampaign: BlockchainCampaign = {
      id: campaignId,
      title: "Sample Campaign",
      description: "This is a sample campaign for testing",
      imageUrl: "https://example.com/image.jpg",
      targetAmount: 10000,
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      amountRaised: 2500,
      campaignType: 0, // startup
      state: 0, // active
      owner: "0x123456789",
      balance: 2500,
      tiers: [
        { name: "Basic", amount: 100, description: "Basic rewards" },
        { name: "Premium", amount: 500, description: "Premium rewards" },
        { name: "Platinum", amount: 1000, description: "Platinum rewards" }
      ],
      contributors: ["0xabc123", "0xdef456", "0xghi789"],
      contributions: [100, 400, 2000],
      approvers: ["0xghi789"],
      approvals: [],
      approvalThreshold: 1000
    };
    
    return {
      success: true,
      data: convertBlockchainCampaign(mockCampaign)
    };
  } catch (error) {
    console.error("Error getting campaign details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting campaign details"
    };
  }
};

// Get all campaigns with enhanced error handling
export const getAllCampaigns = async (): Promise<BlockchainResult<Campaign[]>> => {
  try {
    console.log('Getting all campaigns');
    
    // In a real implementation, this would query the Move smart contract
    // using the campaign_factory.get_all_campaigns function
    
    // Mock implementation returning sample campaigns
    const mockCampaigns: BlockchainCampaign[] = [
      {
        id: "campaign-1",
        title: "Tech Startup Funding",
        description: "Funding for a new tech startup in the AI space",
        imageUrl: "https://example.com/tech.jpg",
        targetAmount: 50000,
        deadline: Date.now() + 60 * 24 * 60 * 60 * 1000,
        amountRaised: 25000,
        campaignType: 0, // startup
        state: 0, // active
        owner: "0x123456789",
        balance: 25000,
        tiers: [
          { name: "Supporter", amount: 100, description: "Thank you message" },
          { name: "Investor", amount: 1000, description: "Early access to product" },
          { name: "Partner", amount: 5000, description: "Equity share" }
        ],
        contributors: ["0xabc123", "0xdef456", "0xghi789"],
        contributions: [5000, 10000, 10000],
        approvers: ["0xabc123", "0xdef456", "0xghi789"],
        approvals: ["0xabc123", "0xdef456"],
        approvalThreshold: 5000
      },
      {
        id: "campaign-2",
        title: "Charity for Education",
        description: "Supporting education for underprivileged children",
        imageUrl: "https://example.com/education.jpg",
        targetAmount: 10000,
        deadline: Date.now() + 90 * 24 * 60 * 60 * 1000,
        amountRaised: 7500,
        campaignType: 1, // donation
        state: 0, // active
        owner: "0x987654321",
        balance: 7500,
        tiers: [
          { name: "Friend", amount: 50, description: "Thank you letter" },
          { name: "Champion", amount: 200, description: "Recognition on website" },
          { name: "Hero", amount: 500, description: "Special certificate" }
        ],
        contributors: ["0xjkl123", "0xmno456", "0xpqr789", "0xstu012"],
        contributions: [500, 2000, 3000, 2000],
        approvers: ["0xmno456", "0xpqr789", "0xstu012"],
        approvals: ["0xmno456", "0xpqr789"],
        approvalThreshold: 200
      }
    ];
    
    return {
      success: true,
      data: mockCampaigns.map(convertBlockchainCampaign)
    };
  } catch (error) {
    console.error("Error getting all campaigns:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting all campaigns"
    };
  }
};

// Get campaigns in batches with enhanced error handling
export const getCampaignsBatch = async (
  startIndex: number, 
  count: number
): Promise<BlockchainResult<Campaign[]>> => {
  try {
    console.log(`Getting campaigns batch: startIndex=${startIndex}, count=${count}`);
    
    // In a real implementation, this would query the Move smart contract
    // using the campaign_factory.get_campaigns_batch function
    
    // For now, reuse the getAllCampaigns function
    const allCampaignsResult = await getAllCampaigns();
    
    if (!allCampaignsResult.success || !allCampaignsResult.data) {
      return allCampaignsResult;
    }
    
    // Extract the requested batch
    const allCampaigns = allCampaignsResult.data;
    const endIndex = Math.min(startIndex + count, allCampaigns.length);
    
    if (startIndex >= allCampaigns.length) {
      return {
        success: true,
        data: []
      };
    }
    
    return {
      success: true,
      data: allCampaigns.slice(startIndex, endIndex)
    };
  } catch (error) {
    console.error("Error getting campaigns batch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting campaigns batch"
    };
  }
};

// Mock function for wallet connection
export const connectWallet = async (): Promise<BlockchainResult<string>> => {
  try {
    console.log('Connecting to Sui wallet');
    // In a real implementation, this would connect to the Sui wallet
    const address = '0x' + Math.random().toString(16).substr(2, 40);
    
    return {
      success: true,
      data: address
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error connecting wallet"
    };
  }
};

// Get user notifications with enhanced error handling
export const getUserNotifications = async (
  userAddress: string
): Promise<BlockchainResult<CampaignNotification[]>> => {
  try {
    console.log(`Getting notifications for user ${userAddress}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation
    const notifications: CampaignNotification[] = [
      {
        id: "notif-1",
        title: "Campaign Update",
        message: "We've reached 50% of our goal!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        campaignId: "campaign-1"
      },
      {
        id: "notif-2",
        title: "New Milestone",
        message: "We've completed the first development phase",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        campaignId: "campaign-1"
      }
    ];
    
    return {
      success: true,
      data: notifications
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting user notifications"
    };
  }
};

// Get user profile with enhanced error handling
export const getUserProfile = async (
  userAddress: string
): Promise<BlockchainResult<UserProfile>> => {
  try {
    console.log(`Getting profile for user ${userAddress}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation
    const profile: UserProfile = {
      address: userAddress,
      role: 'creator',
      name: "John Doe",
      bio: "Passionate entrepreneur and developer",
      registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      campaignCount: 2,
      contributionCount: 5
    };
    
    return {
      success: true,
      data: profile
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting user profile"
    };
  }
};

// Get influencer profile with enhanced error handling
export const getInfluencerProfile = async (
  influencerAddress: string
): Promise<BlockchainResult<InfluencerProfile>> => {
  try {
    console.log(`Getting profile for influencer ${influencerAddress}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation
    const profile: InfluencerProfile = {
      owner: influencerAddress,
      name: "Crypto Influencer",
      description: "Helping blockchain projects succeed",
      specialties: ["Marketing", "Community Building", "Token Economics"],
      rate: 1000,
      forDonations: true,
      isActive: true
    };
    
    return {
      success: true,
      data: profile
    };
  } catch (error) {
    console.error("Error getting influencer profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting influencer profile"
    };
  }
};

// Check if user has approved withdrawal
export const hasUserApprovedWithdrawal = async (
  campaignId: string,
  userAddress: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Checking if user ${userAddress} has approved withdrawal for campaign ${campaignId}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation
    return {
      success: true,
      data: Math.random() > 0.5 // Randomly return true or false
    };
  } catch (error) {
    console.error("Error checking approval status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking approval status"
    };
  }
};

// Check if user is an approver
export const isUserApprover = async (
  campaignId: string,
  userAddress: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Checking if user ${userAddress} is an approver for campaign ${campaignId}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation
    return {
      success: true,
      data: Math.random() > 0.3 // Randomly return true or false, biased towards true
    };
  } catch (error) {
    console.error("Error checking approver status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking approver status"
    };
  }
};

// Get user contribution amount
export const getUserContribution = async (
  campaignId: string,
  userAddress: string
): Promise<BlockchainResult<number>> => {
  try {
    console.log(`Getting contribution amount for user ${userAddress} in campaign ${campaignId}`);
    
    // In a real implementation, this would query the Move smart contract
    
    // Mock implementation
    return {
      success: true,
      data: Math.floor(Math.random() * 5000) // Random amount between 0-5000
    };
  } catch (error) {
    console.error("Error getting user contribution:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting user contribution"
    };
  }
};

// Clear user notifications
export const clearUserNotifications = async (
  userAddress: string
): Promise<BlockchainResult<boolean>> => {
  try {
    console.log(`Clearing notifications for user ${userAddress}`);
    
    // In a real implementation, this would call the Move smart contract
    // using the campaign_factory.clear_notifications entry function
    
    // Mock implementation
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error("Error clearing user notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error clearing user notifications"
    };
  }
};
