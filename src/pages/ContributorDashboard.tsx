
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useWallet } from "@/contexts/WalletContext";
import { Campaign } from "@/types/Campaign";
import { getAllCampaigns, donateToCampaign, subscribeToCampaign } from "@/lib/sui";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bell, Wallet } from "lucide-react";

export default function ContributorDashboard() {
  const { walletConnected, walletAddress } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [contributions, setContributions] = useState<{campaignId: string, amount: number}[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!walletConnected || !walletAddress) {
      navigate("/");
      return;
    }

    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const result = await getAllCampaigns();
        if (result.success && result.data) {
          setCampaigns(result.data);
          
          // Mock some contributions for display purposes
          const mockContributions = [
            {campaignId: result.data[0]?.id || "campaign-1", amount: 250},
            {campaignId: "campaign-2", amount: 500}
          ];
          setContributions(mockContributions);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaigns();
  }, [walletConnected, walletAddress, navigate]);

  const handleContribute = async () => {
    if (!selectedCampaignId) {
      toast.error("Please select a campaign");
      return;
    }
    
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }
    
    setProcessing(true);
    try {
      const result = await donateToCampaign(
        selectedCampaignId, 
        parseFloat(contributionAmount),
        selectedTierIndex
      );
      
      if (result.success) {
        toast.success("Contribution successful!");
        
        // Add to local contributions list for UI update
        setContributions(prev => [...prev, {
          campaignId: selectedCampaignId,
          amount: parseFloat(contributionAmount)
        }]);
        
        // Reset form
        setContributionAmount("");
        setSelectedCampaignId(null);
      } else {
        toast.error("Contribution failed");
      }
    } catch (error) {
      console.error("Error making contribution:", error);
      toast.error("Error processing contribution");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubscribe = async (campaignId: string) => {
    try {
      const result = await subscribeToCampaign(campaignId);
      
      if (result.success) {
        toast.success("Subscribed to campaign updates!");
      } else {
        toast.error("Subscription failed");
      }
    } catch (error) {
      console.error("Error subscribing to campaign:", error);
      toast.error("Error processing subscription");
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
          <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center">
              <Wallet className="mr-1 h-4 w-4" />
              Connected
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="contribute" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="contribute">Make Contributions</TabsTrigger>
            <TabsTrigger value="history">My Contributions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contribute" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support a Campaign</CardTitle>
                <CardDescription>
                  Choose a campaign and make a contribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="campaign" className="font-medium">Select Campaign</label>
                  <Select onValueChange={(value) => setSelectedCampaignId(value)}>
                    <SelectTrigger id="campaign">
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.title} ({campaign.amountCollected}/{campaign.target} SUI)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCampaignId && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="tier" className="font-medium">Select Tier</label>
                      <Select onValueChange={(value) => setSelectedTierIndex(parseInt(value))}>
                        <SelectTrigger id="tier">
                          <SelectValue placeholder="Select a tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.find(c => c.id === selectedCampaignId)?.tiers.map((tier, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {tier.name} ({tier.amount} SUI): {tier.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="amount" className="font-medium">Contribution Amount (SUI)</label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline" 
                  onClick={() => handleSubscribe(selectedCampaignId || "")}
                  disabled={!selectedCampaignId}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Subscribe to Updates
                </Button>
                <Button 
                  onClick={handleContribute} 
                  disabled={!selectedCampaignId || !contributionAmount || processing}
                >
                  {processing ? "Processing..." : "Contribute"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>My Contributions</CardTitle>
                <CardDescription>
                  History of your campaign contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contributions.length > 0 ? (
                  <div className="space-y-4">
                    {contributions.map((contribution, index) => {
                      const campaign = campaigns.find(c => c.id === contribution.campaignId);
                      return (
                        <Card key={index}>
                          <CardHeader className="py-4">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg">{campaign?.title || "Unknown Campaign"}</CardTitle>
                              <Badge>{contribution.amount} SUI</Badge>
                            </div>
                          </CardHeader>
                          <CardFooter className="py-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/campaign/${contribution.campaignId}`)}
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
                    You haven't made any contributions yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}