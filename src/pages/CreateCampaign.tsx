
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CampaignFormData } from "@/types/Campaign";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { walletConnected, connectWallet } = useWallet();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    target: "",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    image: "",
    campaignType: "donation",
    tierNames: ["Basic", "Standard", "Premium"],
    tierAmounts: ["100", "500", "1000"],
    tierDescriptions: ["Basic reward", "Standard reward", "Premium reward"],
    approvalThreshold: "500"
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (
    index: number,
    field: 'tierNames' | 'tierAmounts' | 'tierDescriptions',
    value: string
  ) => {
    setFormData((prev) => {
      const updatedField = [...prev[field]];
      updatedField[index] = value;
      return { ...prev, [field]: updatedField as [string, string, string] };
    });
  };

  const handleCampaignTypeChange = (value: 'startup' | 'donation') => {
    setFormData((prev) => ({ ...prev, campaignType: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, deadline: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here we would normally interact with the Sui blockchain
      console.log("Submitting campaign:", formData);
      
      toast({
        title: "Campaign created!",
        description: "Your campaign has been created successfully",
      });
      
      // For now, just simulate a success and redirect
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error creating campaign:", error);
      setIsSubmitting(false);
      
      toast({
        title: "Campaign creation failed",
        description: "There was an error creating your campaign",
        variant: "destructive",
      });
    }
  };
  
  const handleConnectWallet = async () => {
    await connectWallet();
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-2xl py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Create a New Campaign</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Fill in the information below to start your fundraising campaign on the Sui blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!walletConnected ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-4">Connect your wallet to create a campaign</h3>
                <Button 
                  onClick={handleConnectWallet}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Give your campaign a clear title"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your campaign and its goals..."
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <RadioGroup 
                    value={formData.campaignType} 
                    onValueChange={(value) => handleCampaignTypeChange(value as 'startup' | 'donation')}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="startup" id="startup" />
                      <Label htmlFor="startup">Startup</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="donation" id="donation" />
                      <Label htmlFor="donation">Donation</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount (SUI)</Label>
                  <Input
                    id="target"
                    name="target"
                    type="number"
                    placeholder="10000"
                    required
                    min="0"
                    step="any"
                    value={formData.target}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="approvalThreshold">Approval Threshold (SUI)</Label>
                  <Input
                    id="approvalThreshold"
                    name="approvalThreshold"
                    type="number"
                    placeholder="500"
                    required
                    min="0"
                    step="any"
                    value={formData.approvalThreshold}
                    onChange={handleFormChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Contributors who donate this amount or more can approve fund withdrawals
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Campaign End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(formData.deadline, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Campaign Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    required
                    value={formData.image}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Reward Tiers</Label>
                  
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="border p-4 rounded-md space-y-3">
                      <h3 className="font-medium">Tier {index + 1}</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`tierName${index}`}>Name</Label>
                        <Input
                          id={`tierName${index}`}
                          placeholder="Tier name"
                          required
                          value={formData.tierNames[index]}
                          onChange={(e) => handleTierChange(index, 'tierNames', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`tierAmount${index}`}>Amount (SUI)</Label>
                        <Input
                          id={`tierAmount${index}`}
                          type="number"
                          placeholder="100"
                          required
                          min="0"
                          step="any"
                          value={formData.tierAmounts[index]}
                          onChange={(e) => handleTierChange(index, 'tierAmounts', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`tierDescription${index}`}>Description</Label>
                        <Input
                          id={`tierDescription${index}`}
                          placeholder="Describe the rewards for this tier"
                          required
                          value={formData.tierDescriptions[index]}
                          onChange={(e) => handleTierChange(index, 'tierDescriptions', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
