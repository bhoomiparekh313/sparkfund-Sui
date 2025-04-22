import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/CampaignCard";
import { Link } from "react-router-dom";
import { UserRoleSelection } from "@/components/UserRoleSelection";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/sui";
import { UserProfile } from "@/types/Campaign";
import { getAllCampaigns } from "@/lib/sui";
import { Rocket, Heart, Shield } from "lucide-react";
import { CategoryFilter } from "@/components/CategoryFilter";
import type { CampaignCategory } from "@/lib/categories";

export default function Index() {
  const { walletConnected, walletAddress } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (walletConnected && walletAddress) {
        try {
          const profileResult = await getUserProfile(walletAddress);
          if (profileResult.success && profileResult.data) {
            setUserProfile(profileResult.data);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      
      try {
        const campaignsResult = await getAllCampaigns();
        if (campaignsResult.success && campaignsResult.data) {
          const sampleCampaigns = [
            {
              ...campaignsResult.data[0],
              title: "AI-Powered Healthcare Assistant",
              description: "Revolutionizing patient care with artificial intelligence",
              image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
              category: "health",
              amountCollected: 1500,
              target: 5000,
            },
            {
              ...campaignsResult.data[0],
              title: "Sustainable Energy Project",
              description: "Creating renewable energy solutions for rural communities",
              image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
              category: "tech",
              amountCollected: 2500,
              target: 8000,
            },
            {
              ...campaignsResult.data[0],
              title: "Education Technology Platform",
              description: "Making quality education accessible to everyone",
              image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
              category: "education",
              amountCollected: 3000,
              target: 10000,
            },
            {
              ...campaignsResult.data[0],
              title: "Mental Health App",
              description: "Supporting mental wellness through technology",
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
              category: "health",
              amountCollected: 2000,
              target: 6000,
            },
            {
              ...campaignsResult.data[0],
              title: "Cybersecurity Training Platform",
              description: "Protecting businesses from cyber threats",
              image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
              category: "tech",
              amountCollected: 4000,
              target: 12000,
            }
          ];
          setFeaturedCampaigns(sampleCampaigns);
        } else {
          setFeaturedCampaigns([]);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [walletConnected, walletAddress]);

  const filteredCampaigns = selectedCategory
    ? featuredCampaigns.filter(campaign => campaign.category === selectedCategory)
    : featuredCampaigns;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-400 to-blue-600 py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl drop-shadow">
              Fund Your Dreams with SparkFund
            </h1>
            <p className="mt-6 text-lg leading-8">
              Launch your startup or donation campaign with SparkFund, the decentralized crowdfunding platform built on Sui blockchain.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/campaigns">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 font-semibold hover:bg-gray-100 hover:text-purple-700 border border-purple-300 shadow">
                  Browse Campaigns
                </Button>
              </Link>
              <Link to="/create-campaign">
                <Button size="lg" variant="default" className="bg-purple-600 text-white font-semibold hover:bg-purple-700 border border-purple-800 shadow">
                  Start a Campaign
                </Button>
              </Link>
              {walletConnected && (
                <Link to="/my-campaigns">
                  <Button size="lg" variant="default" className="bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow">
                    My Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* User Registration Section (show if connected but not registered) */}
      {walletConnected && !userProfile && (
        <div className="container py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Role</h2>
          <UserRoleSelection />
        </div>
      )}
      
      {/* Featured Campaigns */}
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Campaigns</h2>
          <Link to="/campaigns">
            <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
              View All
            </Button>
          </Link>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category as CampaignCategory)}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
      
      {/* How It Works */}
      <div className="bg-slate-50 py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How SparkFund Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Rocket className="text-purple-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Campaign</h3>
              <p className="text-slate-600 max-w-xs">
                Set up your campaign with a compelling story, funding goal, and rewards.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Heart className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Funded</h3>
              <p className="text-slate-600 max-w-xs">
                Share your campaign and receive contributions from supporters worldwide.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Shield className="text-green-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Make It Happen</h3>
              <p className="text-slate-600 max-w-xs">
                When your goal is met, withdraw funds and bring your project to life.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Role Benefits */}
      <div className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Path</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">Creator</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-purple-100 rounded-full p-1 mr-2">✓</span>
                  Launch funding campaigns
                </li>
                <li className="flex items-center">
                  <span className="bg-purple-100 rounded-full p-1 mr-2">✓</span>
                  Set funding tiers with rewards
                </li>
                <li className="flex items-center">
                  <span className="bg-purple-100 rounded-full p-1 mr-2">✓</span>
                  Share updates with backers
                </li>
                <li className="flex items-center">
                  <span className="bg-purple-100 rounded-full p-1 mr-2">✓</span>
                  Manage campaign finances
                </li>
              </ul>
              <div className="mt-6">
                <Link to={walletConnected ? "/profile" : "/"}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    {walletConnected ? "Become a Creator" : "Connect Wallet"}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Contributor</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Back exciting projects
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Receive exclusive rewards
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Track campaign progress
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Get notified of updates
                </li>
              </ul>
              <div className="mt-6">
                <Link to={walletConnected ? "/profile" : "/"}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {walletConnected ? "Become a Contributor" : "Connect Wallet"}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-green-600">Influencer</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-green-100 rounded-full p-1 mr-2">✓</span>
                  Promote promising campaigns
                </li>
                <li className="flex items-center">
                  <span className="bg-green-100 rounded-full p-1 mr-2">✓</span>
                  Earn rewards for successful promotions
                </li>
                <li className="flex items-center">
                  <span className="bg-green-100 rounded-full p-1 mr-2">✓</span>
                  Build your influence portfolio
                </li>
                <li className="flex items-center">
                  <span className="bg-green-100 rounded-full p-1 mr-2">✓</span>
                  Help worthy causes succeed
                </li>
              </ul>
              <div className="mt-6">
                <Link to={walletConnected ? "/profile" : "/"}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {walletConnected ? "Become an Influencer" : "Connect Wallet"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-12">
        <div className="container text-center text-white max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Spark Your Dream?</h2>
          <p className="mb-8 text-lg">
            Join thousands of creators and supporters on SparkFund today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/campaigns">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 font-semibold hover:bg-gray-100 border border-purple-300 hover:text-purple-700">
                Browse Projects
              </Button>
            </Link>
            <Link to="/create-campaign">
              <Button size="lg" variant="default" className="bg-purple-700 text-white font-semibold border border-purple-900 hover:bg-white hover:text-purple-800 hover:border-white transition-colors">
                Start a Campaign
              </Button>
            </Link>
            {walletConnected && (
              <Link to="/notifications">
                <Button size="lg" variant="default" className="bg-blue-800 text-white font-semibold hover:bg-blue-900">
                  Check Notifications
                </Button>
              </Link>
            )}
          </div>
          <p className="mt-8 text-sm opacity-80">
            Secure on-chain crowdfunding powered by Sui blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
