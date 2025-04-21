
module suifunder::campaign_distribution {
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use std::vector;
    
    // Error constants
    const E_NOT_OWNER: u64 = 1;
    const E_ZERO_AMOUNT: u64 = 2;
    const E_SHARE_SUM_NOT_100: u64 = 4;
    
    // Distribution plan for a specific campaign
    struct DistributionPlan has key {
        id: UID,
        campaign_id: ID,
        owner: address,
        recipients: vector<address>,
        shares: vector<u8>, // Percentages that must sum to 100
        total_distributed: u64,
    }
    
    // Records an actual distribution
    struct Distribution has key, store {
        id: UID,
        campaign_id: ID,
        amount: u64,
        timestamp: u64,
        recipient: address,
        share_percentage: u8,
    }
    
    // Events
    struct PlanCreated has copy, drop {
        plan_id: ID,
        campaign_id: ID,
        owner: address,
        recipient_count: u64,
    }
    
    struct FundsDistributed has copy, drop {
        plan_id: ID,
        campaign_id: ID,
        total_amount: u64,
        recipient_count: u64,
    }
    
    // Create a new distribution plan for a campaign
    public entry fun create_distribution_plan(
        campaign_id: ID,
        recipients: vector<address>,
        shares: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&recipients) > 0, E_ZERO_AMOUNT);
        assert!(vector::length(&recipients) == vector::length(&shares), E_ZERO_AMOUNT);
        
        // Verify shares sum to 100%
        let i = 0;
        let sum = 0;
        let len = vector::length(&shares);
        
        while (i < len) {
            sum = sum + *vector::borrow(&shares, i);
            i = i + 1;
        };
        
        assert!(sum == 100, E_SHARE_SUM_NOT_100);
        
        // Create plan
        let plan = DistributionPlan {
            id: object::new(ctx),
            campaign_id,
            owner: tx_context::sender(ctx),
            recipients,
            shares,
            total_distributed: 0,
        };
        
        // Emit event
        event::emit(PlanCreated {
            plan_id: object::id(&plan),
            campaign_id,
            owner: tx_context::sender(ctx),
            recipient_count: vector::length(&recipients),
        });
        
        // Transfer ownership to creator
        transfer::transfer(plan, tx_context::sender(ctx));
    }
    
    // Distribute funds according to plan
    public entry fun distribute_funds(
        plan: &mut DistributionPlan,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(plan.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Get total amount to distribute
        let total_amount = coin::value(&payment);
        assert!(total_amount > 0, E_ZERO_AMOUNT);
        
        // Take the payment
        let payment_balance = coin::into_balance(payment);
        
        // Update total distributed 
        plan.total_distributed = plan.total_distributed + total_amount;
        
        // Keep track of how much we've distributed to detect rounding errors
        let distributed_so_far = 0;
        
        let i = 0;
        let len = vector::length(&plan.recipients);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        while (i < len) {
            let recipient = *vector::borrow(&plan.recipients, i);
            let share = *vector::borrow(&plan.shares, i);
            
            // Calculate amount for this recipient (share is a percentage)
            let recipient_amount = if (i == len - 1) {
                // Last recipient gets the remainder to avoid rounding issues
                total_amount - distributed_so_far
            } else {
                (total_amount * (share as u64)) / 100
            };
            
            // Create a record of this distribution
            let distribution = Distribution {
                id: object::new(ctx),
                campaign_id: plan.campaign_id,
                amount: recipient_amount,
                timestamp,
                recipient,
                share_percentage: share,
            };
            
            // Take the recipient's share from the payment balance
            let recipient_coin = coin::from_balance(
                balance::split(&mut payment_balance, recipient_amount),
                ctx
            );
            
            // Transfer the funds and the receipt
            transfer::public_transfer(recipient_coin, recipient);
            transfer::transfer(distribution, recipient);
            
            // Update tracking
            distributed_so_far = distributed_so_far + recipient_amount;
            i = i + 1;
        };
        
        // Emit event
        event::emit(FundsDistributed {
            plan_id: object::id(plan),
            campaign_id: plan.campaign_id,
            total_amount,
            recipient_count: len,
        });
        
        // If there's any dust left (shouldn't be), return it to sender
        if (balance::value(&payment_balance) > 0) {
            transfer::public_transfer(
                coin::from_balance(payment_balance, ctx),
                tx_context::sender(ctx)
            );
        } else {
            balance::destroy_zero(payment_balance);
        };
    }
    
    // Update the distribution plan
    public entry fun update_distribution_plan(
        plan: &mut DistributionPlan,
        recipients: vector<address>,
        shares: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(plan.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Validate inputs
        assert!(vector::length(&recipients) > 0, E_ZERO_AMOUNT);
        assert!(vector::length(&recipients) == vector::length(&shares), E_ZERO_AMOUNT);
        
        // Verify shares sum to 100%
        let i = 0;
        let sum = 0;
        let len = vector::length(&shares);
        
        while (i < len) {
            sum = sum + *vector::borrow(&shares, i);
            i = i + 1;
        };
        
        assert!(sum == 100, E_SHARE_SUM_NOT_100);
        
        // Update plan
        plan.recipients = recipients;
        plan.shares = shares;
    }
    
    // View functions
    public fun get_total_distributed(plan: &DistributionPlan): u64 {
        plan.total_distributed
    }
    
    public fun get_recipient_count(plan: &DistributionPlan): u64 {
        vector::length(&plan.recipients)
    }
    
    public fun get_campaign_id(plan: &DistributionPlan): ID {
        plan.campaign_id
    }
    
    public fun get_distribution_details(
        distribution: &Distribution
    ): (ID, u64, u64, address, u8) {
        (
            distribution.campaign_id,
            distribution.amount,
            distribution.timestamp,
            distribution.recipient,
            distribution.share_percentage
        )
    }
}
