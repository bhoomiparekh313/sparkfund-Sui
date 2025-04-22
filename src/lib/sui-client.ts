
import { NETWORK } from '@/config/contracts';

// Define our own simplified types instead of importing from @mysten/sui.js
interface Connection {
  fullnode: string;
  faucet: string;
}

class JsonRpcProvider {
  connection: Connection;
  
  constructor(connection: Connection) {
    this.connection = connection;
  }
  
  async getObject({ id, options }: { id: string, options: { showContent: boolean } }) {
    try {
      // Simplified implementation for testnet
      const response = await fetch(`${this.connection.fullnode}/objects/${id}?showContent=${options.showContent}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting object:', error);
      throw error;
    }
  }
  
  async multiGetObjects({ ids, options }: { ids: string[], options: { showContent: boolean } }) {
    try {
      // Simplified implementation
      const results = await Promise.all(ids.map(id => this.getObject({ id, options })));
      return results;
    } catch (error) {
      console.error('Error getting objects:', error);
      throw error;
    }
  }
}

// Initialize the Sui provider based on network configuration
function getNetworkConnection(network: string): Connection {
  switch(network) {
    case 'devnet':
      return {
        fullnode: 'https://fullnode.devnet.sui.io/',
        faucet: 'https://faucet.devnet.sui.io/gas',
      };
    case 'testnet':
      return {
        fullnode: 'https://fullnode.testnet.sui.io/',
        faucet: 'https://faucet.testnet.sui.io/gas',
      };
    case 'mainnet':
      return {
        fullnode: 'https://fullnode.mainnet.sui.io/',
        faucet: '',
      };
    default:
      return {
        fullnode: 'https://fullnode.testnet.sui.io/',
        faucet: 'https://faucet.testnet.sui.io/gas',
      };
  }
}

const connection = getNetworkConnection(NETWORK || 'testnet');
console.log(`Using Sui ${NETWORK || 'testnet'} network:`, connection.fullnode);

export const provider = new JsonRpcProvider(connection);

// Helper function to get object data
export async function getObject(objectId: string) {
  try {
    const object = await provider.getObject({
      id: objectId,
      options: { showContent: true }
    });
    return object;
  } catch (error) {
    console.error('Error fetching object:', error);
    throw error;
  }
}

// Helper function to get multiple objects
export async function getObjects(objectIds: string[]) {
  try {
    const objects = await provider.multiGetObjects({
      ids: objectIds,
      options: { showContent: true }
    });
    return objects;
  } catch (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }
}
