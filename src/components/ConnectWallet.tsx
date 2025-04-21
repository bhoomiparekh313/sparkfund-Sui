
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useMemo } from "react";
import { Wallet } from "lucide-react";

export function ConnectWallet() {
  const { walletConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();
  
  // Format wallet address for display
  const formattedAddress = useMemo(() => {
    if (!walletAddress) return '';
    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
  }, [walletAddress]);

  return walletConnected ? (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 border-none"
        onClick={disconnectWallet}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {formattedAddress}
      </Button>
    </div>
  ) : (
    <Button 
      onClick={connectWallet}
      variant="outline" 
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 border-none"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Sui Wallet
    </Button>
  );
}
