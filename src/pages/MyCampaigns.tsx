
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CampaignCard } from "@/components/CampaignCard";
import { useWallet } from "@/contexts/WalletContext";
import { getUserProfile, getAllCampaigns } from "@/lib/sui";
import { Campaign } from "@/types/Campaign";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyCampaigns() {
  const { walletConnected, walletAddress } = useWallet();
  const [createdCampaigns, setCreatedCampaigns] = useState<Campaign[]>([]);
  const [contributedCampaigns, setContributedCampaigns] = useState<Campaign[]>([]);
  const [subscribedCampaigns, setSubscribedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!walletConnected || !walletAddress) {
        return;
      }
      
      setIsLoading(true);
      try {
        const allCampaigns = await getAllCampaigns();
        
        // Filter campaigns based on user's role
        const created = allCampaigns.filter(campaign => campaign.owner === walletAddress);
        setCreatedCampaigns(created);
        
        // Filter contributed campaigns
        const contributed = allCampaigns.filter(campaign => 
          campaign.donators.includes(walletAddress)
        );
        setContributedCampaigns(contributed);
        
        // For now, we'll use the same data for subscribed campaigns (in a real app, you'd query subscriptions)
        setSubscribedCampaigns(contributed);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampaigns();
  }, [walletConnected, walletAddress]);
  
  const renderCampaignGrid = (campaigns: Campaign[]) => {
    if (campaigns.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No campaigns found.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">My Campaigns</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="created">Created</TabsTrigger>
              <TabsTrigger value="contributed">Contributed</TabsTrigger>
              <TabsTrigger value="subscribed">Subscribed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="created">
              {renderCampaignGrid(createdCampaigns)}
            </TabsContent>
            
            <TabsContent value="contributed">
              {renderCampaignGrid(contributedCampaigns)}
            </TabsContent>
            
            <TabsContent value="subscribed">
              {renderCampaignGrid(subscribedCampaigns)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
