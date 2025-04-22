
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSuiWallet } from '@/hooks/use-sui-wallet';
import { toast } from 'sonner';

interface WalletContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, account, connect, disconnect } = useSuiWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  // Automatically try to restore wallet connection on page load
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (!isConnected && localStorage.getItem('walletAutoConnect') === 'true') {
        try {
          console.log("Attempting to auto-connect wallet");
          await connect();
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    };
    
    tryAutoConnect();
  }, [connect, isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
      // Save auto-connect preference
      localStorage.setItem('walletAutoConnect', 'true');
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Wallet connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    // Clear auto-connect preference
    localStorage.removeItem('walletAutoConnect');
  };

  return (
    <WalletContext.Provider
      value={{
        walletConnected: isConnected,
        walletAddress: account,
        connectWallet: handleConnect,
        disconnectWallet: handleDisconnect,
        isConnecting
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}