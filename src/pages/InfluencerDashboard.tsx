
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useWallet } from "@/contexts/WalletContext";
import { Campaign, InfluencerProfile } from "@/types/Campaign";
import { getAllCampaigns, getInfluencerProfile, startInfluencerCampaign } from "@/lib/sui";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, TrendingUp, Wallet } from "lucide-react";

export default function InfluencerDashboard() {
  const { walletConnected, walletAddress } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profileData, setProfileData] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [promotedCampaigns, setPromotedCampaigns] = useState<{campaignId: string, isPaid: boolean}[]>([]);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!walletConnected || !walletAddress) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Get influencer profile
        const profileResult = await getInfluencerProfile(walletAddress);
        if (profileResult.success && profileResult.data) {
          setProfileData(profileResult.data);
        }
        
        // Get campaigns
        const campaignsResult = await getAllCampaigns();
        if (campaignsResult.success && campaignsResult.data) {
          setCampaigns(campaignsResult.data);
        }
        
        // Mock some promoted campaigns for display
        const mockPromotions = [
          {campaignId: "campaign-1", isPaid: true},
          {campaignId: "campaign-2", isPaid: false}
        ];
        setPromotedCampaigns(mockPromotions);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [walletConnected, walletAddress, navigate]);

  const handlePromote = async (campaignId: string, isPaid: boolean) => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }
    
    setProcessing(true);
    try {
      const result = await startInfluencerCampaign(
        campaignId,
        walletAddress,
        isPaid
      );
      
      if (result.success) {
        toast.success(`Campaign ${isPaid ? 'promotion' : 'endorsement'} started!`);
        
        // Add to local promotions list for UI update
        setPromotedCampaigns(prev => [...prev, {
          campaignId,
          isPaid
        }]);
      } else {
        toast.error("Failed to start promotion");
      }
    } catch (error) {
      console.error("Error promoting campaign:", error);
      toast.error("Error processing promotion request");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Influencer Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center">
              <Wallet className="mr-1 h-4 w-4" />
              Connected
            </Badge>
          </div>
        </div>
        
        {profileData ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p className="text-muted-foreground">{profileData.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">{profileData.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Specialties</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profileData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Rate</h3>
                  <p className="text-muted-foreground">{profileData.rate} SUI per campaign</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Promote Free Campaigns</span>
                  <Switch checked={profileData.forDonations} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Active Status</span>
                  <Switch checked={profileData.isActive} disabled />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/profile")} variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
            
            <div className="md:col-span-2">
              <Tabs defaultValue="available" className="space-y-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="available">Available Campaigns</TabsTrigger>
                  <TabsTrigger value="promoted">My Promotions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="available" className="space-y-4">
                  {campaigns
                    .filter(campaign => !promotedCampaigns.some(p => p.campaignId === campaign.id))
                    .map((campaign) => (
                      <Card key={campaign.id}>
                        <CardHeader>
                          <CardTitle>{campaign.title}</CardTitle>
                          <CardDescription>
                            {campaign.description.length > 100 
                              ? `${campaign.description.substring(0, 100)}...`
                              : campaign.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Campaign Type</p>
                              <p className="text-sm text-muted-foreground capitalize">{campaign.campaignType}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Progress</p>
                              <p className="text-sm text-muted-foreground">
                                {campaign.amountCollected} / {campaign.target} SUI
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            onClick={() => navigate(`/campaign/${campaign.id}`)}
                            variant="ghost"
                          >
                            View Details
                          </Button>
                          <div className="space-x-2">
                            {profileData.forDonations && campaign.campaignType === 'donation' && (
                              <Button
                                onClick={() => handlePromote(campaign.id, false)}
                                variant="outline"
                                disabled={processing}
                              >
                                Endorse Free
                              </Button>
                            )}
                            <Button
                              onClick={() => handlePromote(campaign.id, true)}
                              disabled={processing}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Promote Paid
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </TabsContent>
                
                <TabsContent value="promoted">
                  {promotedCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {promotedCampaigns.map((promotion, index) => {
                        const campaign = campaigns.find(c => c.id === promotion.campaignId);
                        return (
                          <Card key={index}>
                            <CardHeader className="py-4">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{campaign?.title || "Unknown Campaign"}</CardTitle>
                                <Badge variant={promotion.isPaid ? "default" : "secondary"}>
                                  {promotion.isPaid ? "Paid" : "Free"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="text-sm text-muted-foreground">
                                {campaign?.description?.substring(0, 100)}...
                              </p>
                              <div className="mt-2">
                                <p className="text-sm font-medium">Progress</p>
                                <p className="text-sm text-muted-foreground">
                                  {campaign?.amountCollected} / {campaign?.target} SUI
                                </p>
                              </div>
                            </CardContent>
                            <CardFooter className="py-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/campaign/${promotion.campaignId}`)}
                              >
                                View Campaign <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't promoted any campaigns yet
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Influencer Profile Required</CardTitle>
              <CardDescription>
                You need to create an influencer profile before you can promote campaigns
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/profile")}>Create Profile</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}