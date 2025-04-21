
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
      const results = await Promise.all(ids.map(id => this.getObject({ id, options })));
      return results;
    } catch (error) {
      console.error('Error getting objects:', error);
      throw error;
    }
  }
}

// Get the SUI network from the environment variables
const suiNetwork = import.meta.env.VITE_SUI_NETWORK || 'testnet';  // Default to 'testnet' if not set

// Define connection details for different networks
let connection: Connection;
switch (suiNetwork) {
  case 'devnet':
    connection = {
      fullnode: 'https://fullnode.devnet.sui.io/',  // Devnet fullnode URL
      faucet: 'https://faucet.devnet.sui.io/gas',   // Devnet faucet URL
    };
    break;
  case 'mainnet':
    connection = {
      fullnode: 'https://fullnode.mainnet.sui.io/',  // Mainnet fullnode URL
      faucet: 'https://faucet.mainnet.sui.io/gas',   // Mainnet faucet URL
    };
    break;
  case 'testnet':
  default:
    connection = {
      fullnode: 'https://fullnode.testnet.sui.io/',  // Testnet fullnode URL
      faucet: 'https://faucet.testnet.sui.io/gas',   // Testnet faucet URL
    };
    break;
}

// Initialize the Sui provider with the selected network
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
