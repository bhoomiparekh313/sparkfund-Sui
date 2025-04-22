
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useSuiWallet() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.suiWallet) {
        setIsInstalled(true);
        try {
          const accounts = await window.suiWallet.getAccounts();
          if (accounts && accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]);
            console.log("Wallet already connected:", accounts[0]);
          }
        } catch (err) {
          console.error("Error checking wallet:", err);
        }
      }
    };

    checkWallet();
    
    // Add wallet change listener
    const handleAccountChange = (accounts: string[]) => {
      console.log("Account changed:", accounts);
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
      } else {
        setIsConnected(false);
        setAccount(null);
      }
    };
    
    if (window.suiWallet) {
      window.suiWallet.on('accountChanged', handleAccountChange);
    }
    
    return () => {
      if (window.suiWallet) {
        window.suiWallet.removeListener('accountChanged', handleAccountChange);
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.suiWallet) {
      toast.error('Please install Sui Wallet');
      window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
      return;
    }

    try {
      console.log("Connecting to Sui wallet...");
      // First try requestPermissions if available
      try {
        const accounts = await window.suiWallet.requestPermissions();
        console.log("Permission requested, accounts:", accounts);
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          toast.success('Wallet connected successfully');
          return;
        }
      } catch (permissionErr) {
        console.log("Permission request failed, trying getAccounts:", permissionErr);
      }
      
      // Fallback to getAccounts
      const accounts = await window.suiWallet.getAccounts();
      console.log("GetAccounts result:", accounts);
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        toast.success('Wallet connected successfully');
      } else {
        toast.error('No accounts found in wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    toast.info('Wallet disconnected');
  }, []);

  return {
    isInstalled,
    isConnected,
    account,
    connect,
    disconnect
  };
}

