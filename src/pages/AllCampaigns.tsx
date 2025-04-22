import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CampaignCard } from "@/components/CampaignCard";
import { Campaign } from "@/types/Campaign";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryFilter } from "@/components/CategoryFilter";

// Mock data for initial UI development
const dummyCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Water Supply for Remote Village",
    description: "Help us bring clean water to a village that has no access to clean drinking water.",
    target: 5000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
    description: "Support education initiatives for underprivileged children in developing areas.",
    target: 10000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
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
    description: "Help fund a solar energy project to provide sustainable power to a community.",
    target: 15000,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
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
  {
    id: "4",
    title: "Healthcare Access Initiative",
    description: "Expanding medical services in underserved communities with mobile clinics.",
    target: 12000,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    amountCollected: 4200,
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80",
    owner: "0xabc...123",
    donators: ["0x123...", "0x456...", "0x789...", "0xabc..."],
    donations: [1000, 2000, 700, 500],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Supporter", amount: 500, description: "Thank you email" },
      { name: "Advocate", amount: 1000, description: "Thank you email and project updates" },
      { name: "Champion", amount: 2000, description: "All previous rewards plus recognition" }
    ],
    approvers: ["0x123...", "0x456..."],
    approvals: ["0x123..."],
    category: 'health'
  },
  {
    id: "5",
    title: "Ocean Cleanup Initiative",
    description: "Removing plastic pollution from coastal areas and educating communities.",
    target: 8000,
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    amountCollected: 5500,
    image: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=600&q=80",
    owner: "0xdef...456",
    donators: ["0xdef...", "0xghi...", "0xjkl..."],
    donations: [2000, 2500, 1000],
    campaignType: 'donation',
    state: 'successful',
    tiers: [
      { name: "Supporter", amount: 1000, description: "Thank you message" },
      { name: "Advocate", amount: 2000, description: "Thank you message and impact report" },
      { name: "Hero", amount: 3000, description: "All previous rewards plus certificate" }
    ],
    approvers: ["0xdef...", "0xghi...", "0xjkl..."],
    approvals: ["0xdef...", "0xghi..."],
    category: 'environment'
  },
  {
    id: "6",
    title: "Art Education for Youth",
    description: "Creating after-school arts programs in low-income neighborhoods.",
    target: 6000,
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
    amountCollected: 1800,
    image: "https://images.unsplash.com/photo-1508004665551-be40de615c9a?auto=format&fit=crop&w=600&q=80",
    owner: "0xghi...789",
    donators: ["0xmno...", "0xpqr..."],
    donations: [1000, 800],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Friend", amount: 500, description: "Thank you message" },
      { name: "Patron", amount: 1000, description: "Thank you message and art print" },
      { name: "Benefactor", amount: 2000, description: "All previous rewards plus recognition" }
    ],
    approvers: ["0xmno..."],
    approvals: [],
    category: 'education'
  },
  {
    id: "7",
    title: "Digital Literacy for Rural Schools",
    description: "Providing computers and internet access to schools in underserved rural areas.",
    target: 7500,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    amountCollected: 3200,
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80",
    owner: "0xjkl...mno",
    donators: ["0xpqr...", "0xstu..."],
    donations: [1500, 1700],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Supporter", amount: 500, description: "Thank you message" },
      { name: "Sponsor", amount: 1500, description: "School recognition plaque" },
      { name: "Champion", amount: 3000, description: "On-site visit and recognition" }
    ],
    approvers: ["0xjkl...", "0xstu..."],
    approvals: ["0xjkl..."],
    category: 'education'
  },
  {
    id: "8",
    title: "Forest Restoration Project",
    description: "Replanting native trees and restoring biodiversity in degraded forest areas.",
    target: 12000,
    deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
    amountCollected: 6500,
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
    owner: "0xvwx...yz",
    donators: ["0x123...", "0x456...", "0x789..."],
    donations: [2000, 3000, 1500],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Tree Planter", amount: 100, description: "Digital certificate" },
      { name: "Forest Guardian", amount: 1000, description: "Named tree plaque" },
      { name: "Ecosystem Protector", amount: 3000, description: "Annual impact report" }
    ],
    approvers: ["0xvwx...", "0x123..."],
    approvals: ["0xvwx..."],
    category: 'environment'
  },
  {
    id: "9",
    title: "Community Kitchen Initiative",
    description: "Providing nutritious meals and job training for homeless individuals.",
    target: 9000,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    amountCollected: 4800,
    image: "https://images.unsplash.com/photo-1592861956120-e524ae3c9c18?auto=format&fit=crop&w=600&q=80",
    owner: "0xabc...def",
    donators: ["0xghi...", "0xjkl..."],
    donations: [2500, 2300],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Supporter", amount: 250, description: "Thank you message" },
      { name: "Meal Sponsor", amount: 1000, description: "Monthly impact report" },
      { name: "Community Champion", amount: 2500, description: "Special recognition event" }
    ],
    approvers: ["0xabc...", "0xghi..."],
    approvals: [],
    category: 'social'
  },
  {
    id: "10",
    title: "Cultural Heritage Preservation",
    description: "Documenting and preserving traditional crafts and indigenous knowledge.",
    target: 6500,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    amountCollected: 2700,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&q=80",
    owner: "0xdef...ghi",
    donators: ["0xmno..."],
    donations: [2700],
    campaignType: 'donation',
    state: 'active',
    tiers: [
      { name: "Supporter", amount: 250, description: "Digital archive access" },
      { name: "Historian", amount: 1000, description: "Exclusive documentary" },
      { name: "Patron", amount: 2500, description: "Personal artifact replica" }
    ],
    approvers: ["0xdef..."],
    approvals: [],
    category: 'other'
  }
];

type SortOption = "newest" | "mostFunded" | "mostBackers" | "endingSoon";

export default function AllCampaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  
  // Filter campaigns based on search term
  const filteredCampaigns = dummyCampaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort campaigns based on selected option
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "mostFunded":
        return b.amountCollected - a.amountCollected;
      case "mostBackers":
        return b.donators.length - a.donators.length;
      case "endingSoon":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "newest":
      default:
        // Simulating newest by ID for this example
        return parseInt(b.id) - parseInt(a.id);
    }
  });
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Browse All Campaigns</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="w-full md:w-2/3">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-1/3">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="mostFunded">Most Funded</SelectItem>
                <SelectItem value="mostBackers">Most Backers</SelectItem>
                <SelectItem value="endingSoon">Ending Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Display Results */}
        {sortedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">No campaigns found</h2>
            <p className="text-muted-foreground">
              Try changing your search term or check back later for new campaigns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
