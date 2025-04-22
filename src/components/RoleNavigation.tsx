

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/Campaign";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { User, TrendingUp, Wallet } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  role: UserRole;
  onSelect: (role: UserRole) => void;
}

const RoleCard = ({ title, description, icon, path, role, onSelect }: RoleCardProps) => {
  const navigate = useNavigate();
  const { walletConnected } = useWallet();
  
  const handleClick = () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    onSelect(role);
    navigate(path);
  };
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleClick} className="w-full">
          Continue as {title}
        </Button>
      </CardFooter>
    </Card>
  );
};

export function RoleNavigation() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { walletConnected } = useWallet();
  
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    
    // In a real implementation, this would update the user's role in the blockchain
    console.log(`Selected role: ${role}`);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
      <RoleCard
        title="Creator" 
        description="Start fundraising campaigns and manage your projects"
        icon={<Wallet size={24} className="text-primary" />}
        path="/my-campaigns"
        role="creator"
        onSelect={handleRoleSelect}
      />
      
      <RoleCard 
        title="Contributor"
        description="Support campaigns by donating funds and tracking your contributions"
        icon={<User size={24} className="text-primary" />}
        path="/contributor"
        role="contributor"
        onSelect={handleRoleSelect}
      />
      
      <RoleCard
        title="Influencer"
        description="Promote campaigns to your audience and earn rewards" 
        icon={<TrendingUp size={24} className="text-primary" />}
        path="/influencer"
        role="influencer"
        onSelect={handleRoleSelect}
      />
      
      {!walletConnected && (
        <div className="col-span-full mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-center">
          Please connect your wallet to continue
        </div>
      )}
    </div>
  );
}