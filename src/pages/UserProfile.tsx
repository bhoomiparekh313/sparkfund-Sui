
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useWallet } from "@/contexts/WalletContext";
import { getUserProfile } from "@/lib/sui";
import { UserProfile as UserProfileType } from "@/types/Campaign";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreatorProfile } from "@/components/profiles/CreatorProfile";
import { ContributorProfile } from "@/components/profiles/ContributorProfile";
import { InfluencerProfile } from "@/components/profiles/InfluencerProfile";

export default function UserProfile() {
  const { walletConnected, walletAddress } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!walletConnected || !walletAddress) {
        navigate("/");
        return;
      }
      
      setIsLoading(true);
      try {
        const profileResult = await getUserProfile(walletAddress);
        if (profileResult.success && profileResult.data) {
          setUserProfile(profileResult.data);
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

  const handleUpdateProfile = async (data: any) => {
    // TODO: Implement profile update logic
    console.log("Updating profile with:", data);
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
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
            <p>Please register to access your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {userProfile.role === 'creator' && (
            <CreatorProfile userProfile={userProfile} onUpdate={handleUpdateProfile} />
          )}
          {userProfile.role === 'contributor' && (
            <ContributorProfile userProfile={userProfile} onUpdate={handleUpdateProfile} />
          )}
          {userProfile.role === 'influencer' && (
            <InfluencerProfile userProfile={userProfile} onUpdate={handleUpdateProfile} />
          )}
        </div>
      </div>
    </div>
  );
}