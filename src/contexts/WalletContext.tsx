import { createContext, useContext, ReactNode } from 'react';
import { useSuiWallet } from '@/hooks/use-sui-wallet';

interface WalletContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, account, connect, disconnect } = useSuiWallet();

  return (
    <WalletContext.Provider
      value={{
        walletConnected: isConnected,
        walletAddress: account,
        connectWallet: connect,
        disconnectWallet: disconnect,
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
