
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
        const accounts = await window.suiWallet.getAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        }
      }
    };

    checkWallet();
  }, []);

  const connect = useCallback(async () => {
    if (!window.suiWallet) {
      toast.error('Please install Sui Wallet');
      window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
      return;
    }

    try {
      // Use getAccounts instead of requestPermissions if that's what the wallet API provides
      const accounts = await window.suiWallet.getAccounts();
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        toast.success('Wallet connected successfully');
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
