import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Campaign } from "@/types/Campaign";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

const dummyCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Water Supply for Remote Village",
    description: "Help us bring clean water to a village that has no access to clean drinking water. This project aims to construct a water well and filtration system that will serve over 500 people in the community. With your support, we can help improve health, sanitation, and quality of life for these villagers. The funds will cover equipment, labor, materials, and maintenance training for community members.",
    target: 5000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    amountCollected: 2500,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
    owner: "0x123...abc",
    donators: ["0xabc...", "0xdef...", "0xghi..."],
    donations: [100, 250, 500],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Basic", amount: 100, description: "Thank you message" },
      { name: "Standard", amount: 250, description: "Thank you message and project updates" },
      { name: "Premium", amount: 500, description: "All previous rewards plus name on donor wall" }
    ],
    approvers: ["0xabc...", "0xdef..."],
    approvals: ["0xabc..."],
    category: 'environment'
  },
  {
    id: "2",
    title: "Education for Children",
    description: "Support education initiatives for underprivileged children in developing areas. Your donation will help provide school supplies, books, and educational resources to children who otherwise wouldn't have access to quality education. We're partnering with local schools to ensure these resources reach the students who need them most.",
    target: 10000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    amountCollected: 3500,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
    owner: "0x456...def",
    donators: ["0xjkl...", "0xmno...", "0xpqr...", "0xstu..."],
    donations: [150, 350, 200, 800],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Friend", amount: 150, description: "Thank you message" },
      { name: "Supporter", amount: 350, description: "Thank you message and quarterly updates" },
      { name: "Champion", amount: 800, description: "All previous rewards plus certificate" }
    ],
    approvers: ["0xjkl...", "0xmno..."],
    approvals: [],
    category: 'education'
  },
  {
    id: "3",
    title: "Renewable Energy Project",
    description: "Help fund a solar energy project to provide sustainable power to a community. This initiative will install solar panels in a remote village currently relying on expensive and polluting diesel generators. The project will significantly reduce carbon emissions while providing a reliable source of electricity for homes, schools, and small businesses.",
    target: 15000,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    amountCollected: 7500,
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80",
    owner: "0x789...ghi",
    donators: ["0xvwx...", "0xyz..."],
    donations: [5000, 2500],
    campaignType: 'startup',
    state: 'active',
    tiers: [
      { name: "Investor", amount: 2500, description: "Quarterly reports" },
      { name: "Partner", amount: 5000, description: "Quarterly reports and project recognition" },
      { name: "Major Stakeholder", amount: 7500, description: "All previous rewards plus early access" }
    ],
    approvers: ["0xvwx...", "0xyz..."],
    approvals: ["0xvwx..."],
    category: 'tech'
  },
];

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { walletConnected, walletAddress, connectWallet } = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const foundCampaign = dummyCampaigns.find(c => c.id === id);
    setCampaign(foundCampaign || null);
  }, [id]);
  
  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold">Campaign not found</h1>
          <p className="mt-4 text-muted-foreground">The campaign you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-8">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const progress = Math.min((campaign.amountCollected / campaign.target) * 100, 100);
  
  const remainingDays = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to donate",
        variant: "destructive",
      });
      return;
    }
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Donating ${donationAmount} SUI to campaign ${campaign.id}`);
      
      setTimeout(() => {
        setCampaign(prev => {
          if (!prev) return null;
          
          const amount = parseFloat(donationAmount);
          return {
            ...prev,
            amountCollected: prev.amountCollected + amount,
            donators: [...prev.donators, walletAddress || "0xYourAddress..."],
            donations: [...prev.donations, amount],
          };
        });
        
        toast({
          title: "Donation successful!",
          description: `You donated ${donationAmount} SUI to this campaign`,
        });
        
        setDonationAmount("");
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error donating:", error);
      setIsSubmitting(false);
      
      toast({
        title: "Donation failed",
        description: "There was an error processing your donation",
        variant: "destructive",
      });
    }
  };
  
  const handleConnectWalletAndDonate = async () => {
    await connectWallet();
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <Link to="/" className="text-blue-500 hover:underline inline-flex items-center mb-6">
          ← Back to campaigns
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={campaign.image} 
                alt={campaign.title}
                className="w-full h-64 object-cover" 
              />
            </div>
            
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{campaign.amountCollected} SUI raised</span>
                <span className="text-muted-foreground">of {campaign.target} SUI goal</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{remainingDays}</div>
                <div className="text-sm text-muted-foreground">Days Left</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{campaign.amountCollected}</div>
                <div className="text-sm text-muted-foreground">SUI Raised</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{campaign.donators.length}</div>
                <div className="text-sm text-muted-foreground">Backers</div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Campaign Story</h2>
              <p className="text-muted-foreground whitespace-pre-line">{campaign.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-xl font-bold mb-4">Creator</h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div>
                  <div className="font-medium">Campaign Creator</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {campaign.owner}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-xl font-bold mb-4">Donors</h2>
              {campaign.donators.length > 0 ? (
                <div className="space-y-2">
                  {campaign.donators.map((donator, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="text-sm truncate max-w-xs">{donator}</div>
                      <div className="font-medium">{campaign.donations[i]} SUI</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No donations yet. Be the first one to donate!</p>
              )}
            </div>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Back this project</h2>
                <form onSubmit={handleDonate} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      Donation Amount (SUI)
                    </label>
                    <div className="flex">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        min="0.000001"
                        step="any"
                        required
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 py-2 rounded-r-md border-y border-r">
                        SUI
                      </div>
                    </div>
                  </div>
                  
                  {walletConnected ? (
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Fund Campaign"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleConnectWalletAndDonate}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      Connect Wallet to Donate
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    By backing this campaign, you are directly supporting the cause 
                    with a transparent transaction on the Sui blockchain.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
