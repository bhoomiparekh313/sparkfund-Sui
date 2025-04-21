
module suifunder::campaign_tiers {
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::option;
    
    // Tier reward status
    const REWARD_STATUS_PENDING: u8 = 0;
    const REWARD_STATUS_FULFILLED: u8 = 1;
    const REWARD_STATUS_CANCELED: u8 = 2;
    
    // Errors
    const E_INVALID_STATUS: u64 = 1;
    
    // Reward object that contributors receive
    struct TierReward has key {
        id: UID,
        campaign_id: ID,
        tier_index: u8,
        contributor: address,
        tier_name: String,
        tier_description: String,
        amount: u64,
        status: u8,
        claimed_at: option::Option<u64>,
        fulfilled_at: option::Option<u64>,
    }
    
    // Events
    struct RewardCreated has copy, drop {
        reward_id: ID,
        campaign_id: ID,
        contributor: address,
        tier_name: String,
        amount: u64,
    }
    
    struct RewardFulfilled has copy, drop {
        reward_id: ID,
        campaign_id: ID,
        contributor: address,
    }
    
    struct RewardCanceled has copy, drop {
        reward_id: ID,
        campaign_id: ID,
        contributor: address,
    }
    
    // Create a new tier reward
    public fun create_tier_reward(
        campaign_id: ID,
        tier_index: u8,
        contributor: address,
        tier_name: vector<u8>,
        tier_description: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ): TierReward {
        let reward = TierReward {
            id: object::new(ctx),
            campaign_id,
            tier_index,
            contributor,
            tier_name: string::utf8(tier_name),
            tier_description: string::utf8(tier_description),
            amount,
            status: REWARD_STATUS_PENDING,
            claimed_at: option::none(),
            fulfilled_at: option::none(),
        };
        
        // Emit event
        event::emit(RewardCreated {
            reward_id: object::id(&reward),
            campaign_id,
            contributor,
            tier_name: string::utf8(tier_name),
            amount,
        });
        
        reward
    }
    
    // Send a reward to a contributor
    public entry fun send_reward(
        campaign_id: ID,
        tier_index: u8,
        contributor: address,
        tier_name: vector<u8>,
        tier_description: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let reward = create_tier_reward(
            campaign_id,
            tier_index, 
            contributor,
            tier_name,
            tier_description,
            amount,
            ctx
        );
        
        transfer::transfer(reward, contributor);
    }
    
    // Mark a reward as fulfilled (by campaign creator)
    public entry fun fulfill_reward(
        reward: &mut TierReward,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        // Only the campaign creator should be able to fulfill
        // In a real implementation, we'd check that the sender is the campaign owner
        
        // Check reward status
        assert!(reward.status == REWARD_STATUS_PENDING, E_INVALID_STATUS);
        
        // Update status
        reward.status = REWARD_STATUS_FULFILLED;
        reward.fulfilled_at = option::some(clock::timestamp_ms(clock));
        
        // Emit event
        event::emit(RewardFulfilled {
            reward_id: object::id(reward),
            campaign_id: reward.campaign_id,
            contributor: reward.contributor,
        });
    }
    
    // Cancel a reward (by campaign creator)
    public entry fun cancel_reward(
        reward: &mut TierReward,
        _ctx: &mut TxContext
    ) {
        // Only the campaign creator should be able to cancel
        // In a real implementation, we'd check that the sender is the campaign owner
        
        // Check reward status
        assert!(reward.status == REWARD_STATUS_PENDING, E_INVALID_STATUS);
        
        // Update status
        reward.status = REWARD_STATUS_CANCELED;
        
        // Emit event
        event::emit(RewardCanceled {
            reward_id: object::id(reward),
            campaign_id: reward.campaign_id,
            contributor: reward.contributor,
        });
    }
    
    // Check if a reward has been fulfilled
    public fun is_fulfilled(reward: &TierReward): bool {
        reward.status == REWARD_STATUS_FULFILLED
    }
    
    // Check if a reward has been canceled
    public fun is_canceled(reward: &TierReward): bool {
        reward.status == REWARD_STATUS_CANCELED
    }
    
    // Get reward details
    public fun get_reward_details(reward: &TierReward): (ID, u8, address, String, String, u64, u8) {
        (
            reward.campaign_id,
            reward.tier_index,
            reward.contributor,
            reward.tier_name,
            reward.tier_description,
            reward.amount,
            reward.status
        )
    }
}
