
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { registerUser } from "@/lib/sui";
import { toast } from "sonner";
import { UserRole } from "@/types/Campaign";

export function UserRoleSelection() {
  const { walletConnected, walletAddress } = useWallet();
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelection = async (role: UserRole) => {
    if (!walletConnected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsRegistering(true);
    try {
      console.log(`Registering as ${role}...`);
      
      // Register user with selected role
      await registerUser(
        role,
        role === 'influencer' ? "New User" : "",
        role === 'influencer' ? "Your bio here" : ""
      );
      
      console.log(`Successfully registered as ${role}`);
      toast.success(`Registered as ${role}`);
      
      // Redirect based on role
      if (role === 'creator') {
        navigate('/create-campaign');
      } else if (role === 'contributor') {
        navigate('/campaigns');
      } else if (role === 'influencer') {
        navigate('/profile');
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="text-center">
          <CardTitle>Creator</CardTitle>
          <CardDescription>Start your own campaign</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Launch a startup or donation campaign and get funded by the community.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => handleRoleSelection('creator')}
            disabled={isRegistering || !walletConnected}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isRegistering ? "Registering..." : "Register as Creator"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="text-center">
          <CardTitle>Contributor</CardTitle>
          <CardDescription>Support campaigns</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Browse and contribute to campaigns that you believe in.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => handleRoleSelection('contributor')}
            disabled={isRegistering || !walletConnected}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isRegistering ? "Registering..." : "Register as Contributor"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="text-center">
          <CardTitle>Influencer</CardTitle>
          <CardDescription>Amplify campaigns</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Promote campaigns to your audience and earn rewards.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => handleRoleSelection('influencer')}
            disabled={isRegistering || !walletConnected}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isRegistering ? "Registering..." : "Register as Influencer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}