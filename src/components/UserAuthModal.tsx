import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserRoleSelection } from "./UserRoleSelection";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { ConnectWallet } from "./ConnectWallet";

interface UserAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAuthModal({ open, onOpenChange }: UserAuthModalProps) {
  const { walletConnected } = useWallet();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Get Started</DialogTitle>
          <DialogDescription>
            {!walletConnected 
              ? "Connect your wallet to register and access SparkFund features."
              : "Choose your role and register to access SparkFund features."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {!walletConnected ? (
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          ) : (
            <UserRoleSelection />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
