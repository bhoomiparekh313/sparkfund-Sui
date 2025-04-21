
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deployMoveContracts } from '@/lib/contract-deployment';
import { toast } from 'sonner';

export function ContractDeployment() {
  const [privateKey, setPrivateKey] = useState('');
  const [networkType, setNetworkType] = useState<'testnet' | 'devnet' | 'mainnet'>('testnet');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeployment = async () => {
    if (!privateKey) {
      toast.error('Please provide a private key');
      return;
    }

    setIsDeploying(true);
    try {
      const result = await deployMoveContracts({ 
        privateKey, 
        networkType 
      });

      if (result.success) {
        toast.success('Contracts deployed successfully!');
        // Here you could save contract addresses to local storage or context
      } else {
        toast.error(result.message || 'Deployment failed');
      }
    } catch (error) {
      toast.error('Unexpected error during deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>SuiFunder Contract Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input 
              type="password"
              placeholder="Enter Private Key" 
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <Select 
              value={networkType} 
              onValueChange={(value: 'testnet' | 'devnet' | 'mainnet') => setNetworkType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="devnet">Devnet</SelectItem>
                <SelectItem value="mainnet">Mainnet</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleDeployment} 
              disabled={isDeploying}
              className="w-full"
            >
              {isDeploying ? 'Deploying...' : 'Deploy Contracts'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
