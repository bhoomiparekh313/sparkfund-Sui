
# SuiFunder Smart Contracts

This directory contains the Move smart contracts for the SuiFunder platform on the Sui blockchain.

## Overview

The SuiFunder platform consists of three main smart contract modules:

1. **campaign.move**: Core functionality for creating and managing fundraising campaigns
2. **campaign_factory.move**: Registry to track all campaigns created on the platform
3. **campaign_showcase.move**: Features and trending campaigns management

## Smart Contract Details

### Campaign Module

The `campaign.move` module provides the core functionality:

- Creating fundraising campaigns with details (title, description, target amount, deadline)
- Accepting donations to campaigns
- Withdrawing funds by campaign owners
- Campaign status management (active, completed, cancelled)

### Campaign Factory Module

The `campaign_factory.move` module maintains a registry of all campaigns:

- Tracks all campaigns created on the platform
- Provides functions to query campaigns by various criteria
- Simplifies frontend interaction with the blockchain

### Campaign Showcase Module

The `campaign_showcase.move` module manages featured and trending campaigns:

- Admins can highlight selected campaigns as "featured"
- Automated tracking of trending campaigns based on activity
- Provides convenient access to top campaigns for the frontend

## Building and Testing

To build and test the smart contracts:

```bash
# Navigate to the move directory
cd move

# Build the contracts
sui move build

# Test the contracts
sui move test
```

## Deploying to Testnet or Mainnet

```bash
# Deploy to testnet
sui client publish --gas-budget 10000000 --json

# Deploy to mainnet (when ready)
sui client publish --gas-budget 10000000 --json --network mainnet
```

## Contract Addresses

After deployment, update the following addresses in your frontend configuration:

- Campaign Module: [TBD]
- Campaign Factory: [TBD]
- Campaign Showcase: [TBD]
