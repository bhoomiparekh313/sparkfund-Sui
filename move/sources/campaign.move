
module suifunder::campaign {
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::vec_map::{Self, VecMap};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;
    
    // Campaign status
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_COMPLETED: u8 = 1;
    const STATUS_CANCELLED: u8 = 2;
    
    // Error codes
    const E_NOT_OWNER: u64 = 0;
    const E_CAMPAIGN_NOT_ACTIVE: u64 = 1;
    const E_DEADLINE_PASSED: u64 = 2;
    const E_TARGET_NOT_REACHED: u64 = 3;
    const E_ZERO_AMOUNT: u64 = 4;
    const E_INVALID_STATUS: u64 = 5;
    const E_ALREADY_CLAIMED: u64 = 6;
    const E_NOT_CONTRIBUTOR: u64 = 7;
    const E_DEADLINE_NOT_PASSED: u64 = 8;
    
    // Campaign object
    struct Campaign has key {
        id: UID,
        owner: address,
        title: String,
        description: String,
        image_url: String,
        target_amount: u64,
        deadline: u64,
        status: u8,
        balance: Balance<SUI>,
        contributors: VecMap<address, u64>,
        created_at: u64,
        updated_at: u64,
        category: String,
        tags: vector<String>,
    }
    
    // Contribution receipt
    struct ContributionReceipt has key, store {
        id: UID,
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        refunded: bool,
    }
    
    // Events
    struct CampaignCreated has copy, drop {
        campaign_id: ID,
        owner: address,
        title: String,
        target_amount: u64,
        deadline: u64,
    }
    
    struct ContributionMade has copy, drop {
        campaign_id: ID,
        contributor: address,
        amount: u64,
    }
    
    struct CampaignCompleted has copy, drop {
        campaign_id: ID,
        owner: address,
        total_raised: u64,
    }
    
    struct CampaignCancelled has copy, drop {
        campaign_id: ID,
        owner: address,
        total_raised: u64,
    }
    
    struct FundsWithdrawn has copy, drop {
        campaign_id: ID,
        owner: address,
        amount: u64,
    }
    
    struct RefundClaimed has copy, drop {
        campaign_id: ID,
        contributor: address,
        amount: u64,
    }
    
    // Create a new campaign
    public entry fun create_campaign(
        title: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        target_amount: u64,
        deadline: u64,
        category: vector<u8>,
        tags: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(target_amount > 0, E_ZERO_AMOUNT);
        assert!(deadline > clock::timestamp_ms(clock), E_DEADLINE_PASSED);
        
        // Convert tags to strings
        let tag_strings = vector::empty<String>();
        let i = 0;
        let len = vector::length(&tags);
        
        while (i < len) {
            let tag = vector::borrow(&tags, i);
            vector::push_back(&mut tag_strings, string::utf8(*tag));
            i = i + 1;
        };
        
        // Create campaign
        let campaign = Campaign {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            target_amount,
            deadline,
            status: STATUS_ACTIVE,
            balance: balance::zero(),
            contributors: vec_map::empty(),
            created_at: clock::timestamp_ms(clock),
            updated_at: clock::timestamp_ms(clock),
            category: string::utf8(category),
            tags: tag_strings,
        };
        
        // Emit event
        event::emit(CampaignCreated {
            campaign_id: object::id(&campaign),
            owner: campaign.owner,
            title: campaign.title,
            target_amount,
            deadline,
        });
        
        // Share the campaign object
        transfer::share_object(campaign);
    }
    
    // Contribute to a campaign
    public entry fun contribute(
        campaign: &mut Campaign,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check campaign is active
        assert!(campaign.status == STATUS_ACTIVE, E_CAMPAIGN_NOT_ACTIVE);
        
        // Check deadline not passed
        assert!(clock::timestamp_ms(clock) <= campaign.deadline, E_DEADLINE_PASSED);
        
        // Get contribution amount
        let amount = coin::value(&payment);
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        // Add to campaign balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut campaign.balance, payment_balance);
        
        // Update contributor record
        let sender = tx_context::sender(ctx);
        if (vec_map::contains(&campaign.contributors, &sender)) {
            let prev_amount = vec_map::get_mut(&mut campaign.contributors, &sender);
            *prev_amount = *prev_amount + amount;
        } else {
            vec_map::insert(&mut campaign.contributors, sender, amount);
        };
        
        // Create receipt
        let receipt = ContributionReceipt {
            id: object::new(ctx),
            campaign_id: object::id(campaign),
            contributor: sender,
            amount,
            timestamp: clock::timestamp_ms(clock),
            refunded: false,
        };
        
        // Emit event
        event::emit(ContributionMade {
            campaign_id: object::id(campaign),
            contributor: sender,
            amount,
        });
        
        // Transfer receipt to contributor
        transfer::transfer(receipt, sender);
        
        // Check if target reached and update status if needed
        if (balance::value(&campaign.balance) >= campaign.target_amount) {
            campaign.status = STATUS_COMPLETED;
            campaign.updated_at = clock::timestamp_ms(clock);
            
            // Emit completion event
            event::emit(CampaignCompleted {
                campaign_id: object::id(campaign),
                owner: campaign.owner,
                total_raised: balance::value(&campaign.balance),
            });
        };
    }
    
    // Withdraw funds (only for campaign owner and only if successful)
    public entry fun withdraw_funds(
        campaign: &mut Campaign,
        ctx: &mut TxContext
    ) {
        // Check ownership
        assert!(campaign.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Check campaign is completed
        assert!(campaign.status == STATUS_COMPLETED, E_CAMPAIGN_NOT_ACTIVE);
        
        // Get amount to withdraw
        let amount = balance::value(&campaign.balance);
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        // Create coin from balance
        let coin = coin::from_balance(balance::split(&mut campaign.balance, amount), ctx);
        
        // Emit event
        event::emit(FundsWithdrawn {
            campaign_id: object::id(campaign),
            owner: campaign.owner,
            amount,
        });
        
        // Transfer funds to owner
        transfer::public_transfer(coin, campaign.owner);
    }
    
    // Cancel campaign (only owner and only if not completed)
    public entry fun cancel_campaign(
        campaign: &mut Campaign,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check ownership
        assert!(campaign.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Check campaign is active
        assert!(campaign.status == STATUS_ACTIVE, E_INVALID_STATUS);
        
        // Update status
        campaign.status = STATUS_CANCELLED;
        campaign.updated_at = clock::timestamp_ms(clock);
        
        // Emit event
        event::emit(CampaignCancelled {
            campaign_id: object::id(campaign),
            owner: campaign.owner,
            total_raised: balance::value(&campaign.balance),
        });
    }
    
    // Claim refund (for contributors if campaign is cancelled or deadline passed without reaching target)
    public entry fun claim_refund(
        campaign: &mut Campaign,
        receipt: &mut ContributionReceipt,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify receipt matches campaign
        assert!(receipt.campaign_id == object::id(campaign), E_NOT_CONTRIBUTOR);
        
        // Verify sender is the contributor
        assert!(receipt.contributor == tx_context::sender(ctx), E_NOT_CONTRIBUTOR);
        
        // Check receipt not already refunded
        assert!(!receipt.refunded, E_ALREADY_CLAIMED);
        
        // Check campaign is cancelled or deadline passed without reaching target
        let can_refund = campaign.status == STATUS_CANCELLED || 
                        (campaign.status == STATUS_ACTIVE && 
                         clock::timestamp_ms(clock) > campaign.deadline && 
                         balance::value(&campaign.balance) < campaign.target_amount);
                         
        assert!(can_refund, E_CAMPAIGN_NOT_ACTIVE);
        
        // Get refund amount
        let refund_amount = receipt.amount;
        assert!(refund_amount > 0, E_ZERO_AMOUNT);
        
        // Mark receipt as refunded
        receipt.refunded = true;
        
        // Create coin from balance
        let coin = coin::from_balance(balance::split(&mut campaign.balance, refund_amount), ctx);
        
        // Emit event
        event::emit(RefundClaimed {
            campaign_id: object::id(campaign),
            contributor: receipt.contributor,
            amount: refund_amount,
        });
        
        // Transfer refund to contributor
        transfer::public_transfer(coin, receipt.contributor);
    }
    
    // Complete campaign if deadline passed and target reached
    public entry fun complete_campaign_if_ready(
        campaign: &mut Campaign,
        clock: &Clock,
    ) {
        // Check campaign is active
        assert!(campaign.status == STATUS_ACTIVE, E_CAMPAIGN_NOT_ACTIVE);
        
        // Check deadline passed
        assert!(clock::timestamp_ms(clock) > campaign.deadline, E_DEADLINE_NOT_PASSED);
        
        // Check target reached
        assert!(balance::value(&campaign.balance) >= campaign.target_amount, E_TARGET_NOT_REACHED);
        
        // Update status
        campaign.status = STATUS_COMPLETED;
        campaign.updated_at = clock::timestamp_ms(clock);
        
        // Emit event
        event::emit(CampaignCompleted {
            campaign_id: object::id(campaign),
            owner: campaign.owner,
            total_raised: balance::value(&campaign.balance),
        });
    }
    
    // View functions
    
    // Get campaign details
    public fun get_campaign_details(campaign: &Campaign): (
        address, String, String, String, u64, u64, u8, u64, u64, u64, String
    ) {
        (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.image_url,
            campaign.target_amount,
            campaign.deadline,
            campaign.status,
            balance::value(&campaign.balance),
            campaign.created_at,
            campaign.updated_at,
            campaign.category
        )
    }
    
    // Get campaign tags
    public fun get_campaign_tags(campaign: &Campaign): vector<String> {
        campaign.tags
    }
    
    // Get contribution amount for a specific address
    public fun get_contribution_amount(campaign: &Campaign, contributor: address): u64 {
        if (vec_map::contains(&campaign.contributors, &contributor)) {
            *vec_map::get(&campaign.contributors, &contributor)
        } else {
            0
        }
    }
    
    // Get total number of contributors
    public fun get_contributor_count(campaign: &Campaign): u64 {
        vec_map::size(&campaign.contributors)
    }
    
    // Check if campaign is active
    public fun is_active(campaign: &Campaign): bool {
        campaign.status == STATUS_ACTIVE
    }
    
    // Check if campaign is completed
    public fun is_completed(campaign: &Campaign): bool {
        campaign.status == STATUS_COMPLETED
    }
    
    // Check if campaign is cancelled
    public fun is_cancelled(campaign: &Campaign): bool {
        campaign.status == STATUS_CANCELLED
    }
    
    // Check if campaign deadline has passed
    public fun is_deadline_passed(campaign: &Campaign, clock: &Clock): bool {
        clock::timestamp_ms(clock) > campaign.deadline
    }
    
    // Check if campaign target has been reached
    public fun is_target_reached(campaign: &Campaign): bool {
        balance::value(&campaign.balance) >= campaign.target_amount
    }
    
    // Get contribution receipt details
    public fun get_receipt_details(receipt: &ContributionReceipt): (ID, address, u64, u64, bool) {
        (
            receipt.campaign_id,
            receipt.contributor,
            receipt.amount,
            receipt.timestamp,
            receipt.refunded
        )
    }
}
