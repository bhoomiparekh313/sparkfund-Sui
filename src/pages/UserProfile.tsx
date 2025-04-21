
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/contexts/WalletContext";
import { getUserProfile, createInfluencerProfile, getInfluencerProfile } from "@/lib/sui";
import { UserProfile as UserProfileType, InfluencerProfile } from "@/types/Campaign";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { walletConnected, walletAddress } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [influencerProfile, setInfluencerProfile] = useState<InfluencerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Form states for profile updates
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [rate, setRate] = useState("0");
  const [forDonations, setForDonations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!walletConnected || !walletAddress) {
        navigate("/");
        return;
      }
      
      setIsLoading(true);
      try {
        const profile = await getUserProfile(walletAddress);
        setUserProfile(profile);
        
        if (profile?.role === 'influencer') {
          // Get the influencer profile separately
          const infProfile = await getInfluencerProfile(walletAddress);
          setInfluencerProfile(infProfile);
          
          if (infProfile) {
            setName(infProfile.name);
            setBio(infProfile.description || "");
            setSpecialties(infProfile.specialties?.join(", ") || "");
            setRate(String(infProfile.rate || 0));
            setForDonations(infProfile.forDonations);
          }
        } else {
          setName(profile?.name || "");
          setBio(profile?.bio || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [walletAddress, walletConnected, navigate]);
  
  const handleSubmitInfluencerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected || !walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const specialtiesList = specialties.split(",").map(s => s.trim()).filter(s => s !== "");
      
      await createInfluencerProfile(
        name,
        bio,
        specialtiesList,
        Number(rate),
        forDonations
      );
      
      toast.success("Influencer profile updated successfully");
    } catch (error) {
      console.error("Error updating influencer profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Profile Not Found</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="mb-4">You need to register before accessing your profile.</p>
              <Button onClick={() => navigate("/")}>Go to Registration</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">General Info</TabsTrigger>
            {userProfile?.role === 'influencer' && (
              <TabsTrigger value="influencer">Influencer Settings</TabsTrigger>
            )}
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Wallet Address</Label>
                      <Input 
                        id="address" 
                        value={walletAddress || ""} 
                        disabled 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={userProfile?.role || ""} 
                        disabled 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {userProfile?.role === 'influencer' && (
            <TabsContent value="influencer">
              <Card>
                <CardHeader>
                  <CardTitle>Influencer Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitInfluencerProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialties">Specialties (comma separated)</Label>
                      <Textarea 
                        id="specialties" 
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        placeholder="Marketing, Community Building, Token Economics"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rate">Rate (SUI)</Label>
                      <Input 
                        id="rate" 
                        type="number"
                        min="0"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="forDonations"
                        checked={forDonations}
                        onChange={(e) => setForDonations(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="forDonations">I'm willing to promote donation campaigns for free</Label>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Campaigns Created</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.role === 'creator' ? userProfile.campaignCount : 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Contributions Made</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.role === 'contributor' ? userProfile.contributionCount : 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Registered Since</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.registeredAt ? new Date(userProfile.registeredAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
