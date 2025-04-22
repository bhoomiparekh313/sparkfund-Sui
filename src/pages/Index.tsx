import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/types/Campaign";
import { getFeaturedCampaigns } from "@/lib/sui";
import { useNavigate } from "react-router-dom";
import { CampaignCard } from "@/components/CampaignCard";
import { RoleNavigation } from "@/components/RoleNavigation";
import { ArrowRight, Rocket, Users, HeartHandshake } from "lucide-react";

export default function Index() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      setIsLoading(true);
      try {
        const result = await getFeaturedCampaigns();
        if (result.success && result.data) {
          setFeaturedCampaigns(result.data);
        }
      } catch (error) {
        console.error("Error fetching featured campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Welcome to SuiFunder
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The decentralized platform for funding projects, supporting causes, and connecting with supporters on Sui Network
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/campaigns")} 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 transform hover:scale-105"
            >
              Browse Campaigns
            </Button>
            <Button 
              onClick={() => navigate("/create-campaign")} 
              variant="outline" 
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Start a Campaign
            </Button>
          </div>
        </div>
      </section>
      
      {/* Role Selection */}
      <section className="py-16 bg-gradient-to-br from-white via-purple-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Choose Your Role
          </h2>
          <p className="text-muted-foreground mb-8 text-center">
            Select how you want to interact with the SuiFunder platform
          </p>
          
          <RoleNavigation />
        </div>
      </section>
      
      {/* Featured Campaigns */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
              Featured Campaigns
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/campaigns")}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="w-full">
                  <CardContent className="p-0">
                    <div className="h-48 bg-muted animate-pulse" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted animate-pulse rounded-md" />
                      <div className="h-24 bg-muted animate-pulse rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCampaigns.slice(0, 3).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <CardTitle className="mb-2">No Featured Campaigns</CardTitle>
                <CardDescription>
                  Check back later or browse all available campaigns
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Why Choose SuiFunder?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Rocket className="text-purple-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-600">Launch Your Ideas</h3>
                <p className="text-muted-foreground">
                  Turn your vision into reality with our decentralized fundraising platform
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-blue-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-600">Community Support</h3>
                <p className="text-muted-foreground">
                  Connect with a global community of supporters and backers
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="rounded-full bg-pink-100 w-12 h-12 flex items-center justify-center mb-4">
                  <HeartHandshake className="text-pink-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-pink-600">Secure & Transparent</h3>
                <p className="text-muted-foreground">
                  Built on Sui blockchain for maximum security and transparency
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-purple-600">About SuiFunder</h3>
              <p className="text-muted-foreground">
                Empowering creators and innovators through decentralized fundraising on the Sui Network.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-purple-600">Quick Links</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="text-muted-foreground hover:text-purple-600" onClick={() => navigate("/campaigns")}>Browse Campaigns</Button></li>
                <li><Button variant="link" className="text-muted-foreground hover:text-purple-600" onClick={() => navigate("/create-campaign")}>Start a Campaign</Button></li>
                <li><Button variant="link" className="text-muted-foreground hover:text-purple-600" onClick={() => navigate("/profile")}>My Profile</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-purple-600">Connect With Us</h3>
              <div className="flex space-x-4">
                <Button variant="outline" size="icon" className="rounded-full hover:bg-purple-50 hover:text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full hover:bg-purple-50 hover:text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full hover:bg-purple-50 hover:text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SuiFunder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}