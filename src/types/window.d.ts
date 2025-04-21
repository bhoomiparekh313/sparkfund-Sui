
interface Window {
  suiWallet?: {
    getAccounts: () => Promise<string[]>;
    signAndExecuteTransaction: (transaction: any) => Promise<any>;
    executeTransaction: (transaction: any) => Promise<any>;
    signTransaction: (transaction: any) => Promise<any>;
    getNetwork: () => Promise<string>;
    requestPermissions: () => Promise<string[]>;  // Add missing method
    on: (event: string, callback: (args: any) => void) => void;
    removeListener: (event: string, callback: (args: any) => void) => void;
  };
}
