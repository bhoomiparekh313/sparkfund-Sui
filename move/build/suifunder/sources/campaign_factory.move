
module suifunder::campaign_factory {
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;
    
    // User roles
    const USER_ROLE_CREATOR: u8 = 0;
    const USER_ROLE_CONTRIBUTOR: u8 = 1;
    const USER_ROLE_INFLUENCER: u8 = 2;
    
    // Enhanced error codes with descriptive names
    const E_INVALID_ROLE: u64 = 2;
    const E_INVALID_INPUT: u64 = 3;
    const E_INFLUENCER_INACTIVE: u64 = 5;
    const E_INFLUENCER_NO_DONATIONS: u64 = 7;
    const E_NOT_SUBSCRIBED: u64 = 8;
    const E_UNAUTHORIZED: u64 = 11;
    const E_ALREADY_SUBSCRIBED: u64 = 12;
    const E_MAX_NOTIFICATIONS_REACHED: u64 = 13;
    
    // Constants
    const COOLDOWN_PERIOD: u64 = 180000; // 3 minutes in milliseconds
    const MAX_BATCH_SIZE: u64 = 50;
    const MAX_NOTIFICATIONS: u64 = 100;
    
    // Stores all campaign IDs for easier frontend indexing
    struct CampaignRegistry has key {
        id: UID,
        campaigns: vector<ID>,
    }
    
    // User record
    struct User has key, store {
        id: UID,
        role: u8,
        registration_time: u64,
    }
    
    // Influencer profile
    struct InfluencerProfile has key, store {
        id: UID,
        owner: address,
        name: String,
        description: String,
        specialties: vector<String>,
        rate: u64,
        for_donations: bool,
        is_active: bool,
        last_updated: u64, // Added timestamp
    }
    
    // Influencer campaign promotion
    struct InfluencerCampaign has key, store {
        id: UID,
        campaign_id: ID,
        influencer_address: address,
        is_paid: bool,
        is_active: bool,
        engagement_timestamp: u64,
    }
    
    // Campaign notification
    struct CampaignNotification has key, store {
        id: UID,
        title: String,
        message: String,
        timestamp: u64,
        campaign_id: ID,
    }
    
    // User notifications container
    struct UserNotifications has key {
        id: UID,
        owner: address,
        notifications: vector<ID>,
    }
    
    // Campaign subscription container
    struct CampaignSubscriptions has key {
        id: UID,
        owner: address,
        subscriptions: vector<ID>,
    }
    
    // Last action timestamp tracking
    struct LastActionTimestamp has key {
        id: UID,
        owner: address,
        timestamp: u64,
    }
    
    // One-time witness for initialization
    struct CAMPAIGN_FACTORY has drop {}
    
    // Enhanced events with more context
    struct RegistryCreated has copy, drop {
        registry_id: ID,
        timestamp: u64, // Added timestamp
    }
    
    struct UserRegistered has copy, drop {
        user: address,
        role: u8,
        timestamp: u64, // Added timestamp
    }
    
    struct CampaignCreated has copy, drop {
        creator: address,
        campaign_id: ID,
        title: String,
        timestamp: u64, // Added timestamp
    }
    
    struct InfluencerRegistered has copy, drop {
        influencer: address,
        name: String,
        timestamp: u64, // Added timestamp
    }
    
    struct InfluencerCampaignStarted has copy, drop {
        influencer: address,
        campaign_id: ID,
        is_paid: bool, // Added field
        timestamp: u64, // Added timestamp
    }
    
    struct NotificationCreated has copy, drop {
        campaign_id: ID,
        title: String,
        timestamp: u64, // Added timestamp
        recipient_count: u64, // Added for tracking
    }
    
    struct SubscribedToCampaign has copy, drop {
        user: address,
        campaign_id: ID,
        timestamp: u64, // Added timestamp
    }
    
    struct UnsubscribedFromCampaign has copy, drop {
        user: address,
        campaign_id: ID,
        timestamp: u64, // Added timestamp
    }
    
    // === Initialization ===
    
    // This function is called once when the module is published
    fun init(_witness: CAMPAIGN_FACTORY, ctx: &mut TxContext) {
        let registry = CampaignRegistry {
            id: object::new(ctx),
            campaigns: vector::empty(),
        };
        
        event::emit(RegistryCreated {
            registry_id: object::id(&registry),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
        
        // Share the registry - anyone can register campaigns
        transfer::share_object(registry);
    }
    
    // === User Registration ===
    
    // Register a user with a role
    public entry fun register_user(
        role: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate role
        assert!(
            role == USER_ROLE_CREATOR || role == USER_ROLE_CONTRIBUTOR || role == USER_ROLE_INFLUENCER,
            E_INVALID_ROLE
        );
        
        let current_time = clock::timestamp_ms(clock);
        
        // Create user object
        let user = User {
            id: object::new(ctx),
            role,
            registration_time: current_time,
        };
        
        // Create last action timestamp object
        let last_action = LastActionTimestamp {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            timestamp: current_time,
        };
        
        // Create empty notifications container
        let notifications = UserNotifications {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            notifications: vector::empty(),
        };
        
        // Create empty subscriptions container
        let subscriptions = CampaignSubscriptions {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            subscriptions: vector::empty(),
        };
        
        // Transfer objects to user
        transfer::transfer(user, tx_context::sender(ctx));
        transfer::transfer(last_action, tx_context::sender(ctx));
        transfer::share_object(notifications);
        transfer::share_object(subscriptions);
        
        // Emit enhanced event with timestamp
        event::emit(UserRegistered {
            user: tx_context::sender(ctx),
            role,
            timestamp: current_time,
        });
    }
    
    // === Campaign Registration ===
    
    // Register a campaign in the registry
    public entry fun register_campaign(
        registry: &mut CampaignRegistry,
        campaign_id: ID,
        creator: address,
        _title: vector<u8>,
        subscriptions: &mut CampaignSubscriptions,
        clock: &Clock,
    ) {
        // Add campaign to registry
        vector::push_back(&mut registry.campaigns, campaign_id);
        
        let _current_time = clock::timestamp_ms(clock);
        
        // Auto-subscribe creator
        if (subscriptions.owner == creator) {
            // Check if already subscribed to avoid duplicates
            let _already_subscribed = false;
            let i = 0;
            let len = vector::length(&subscriptions.subscriptions);
            
            while (i < len) {
                if (*vector::borrow(&subscriptions.subscriptions, i) == campaign_id) {
                    _already_subscribed = true;
                    break
                };
                i = i + 1;
            };
            
            if (!_already_subscribed) {
                vector::push_back(&mut subscriptions.subscriptions, campaign_id);
            };
        };
        
        // Emit enhanced event with timestamp
        event::emit(CampaignCreated {
            creator,
            campaign_id,
            title: string::utf8(_title),
            timestamp: clock::timestamp_ms(clock),
        });
    }
    
    // === Creator Functions ===
    
    // Create campaign notification for subscribers with better tracking
    public entry fun create_campaign_notification(
        campaign_id: ID,
        title: vector<u8>,
        message: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&title) > 0, E_INVALID_INPUT);
        assert!(vector::length(&message) > 0, E_INVALID_INPUT);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Create notification object
        let notification = CampaignNotification {
            id: object::new(ctx),
            title: string::utf8(title),
            message: string::utf8(message),
            timestamp: current_time,
            campaign_id,
        };
        
        // Share this notification object so it can be discovered
        transfer::share_object(notification);
        
        // Emit enhanced event for indexer consumption
        event::emit(NotificationCreated {
            campaign_id,
            title: string::utf8(title),
            timestamp: current_time,
            recipient_count: 0, // The indexer would update this
        });
    }
    
    // === Influencer Functions ===
    
    // Create influencer profile with enhanced validation
    public entry fun create_influencer_profile(
        name: vector<u8>,
        description: vector<u8>,
        specialties: vector<vector<u8>>,
        rate: u64,
        for_donations: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&name) > 0, E_INVALID_INPUT);
        assert!(vector::length(&description) > 0, E_INVALID_INPUT);
        assert!(vector::length(&specialties) > 0, E_INVALID_INPUT);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Convert specialties to strings
        let spec_strings = vector::empty<String>();
        let i = 0;
        let len = vector::length(&specialties);
        
        while (i < len) {
            let specialty = vector::borrow(&specialties, i);
            vector::push_back(&mut spec_strings, string::utf8(*specialty));
            i = i + 1;
        };
        
        // Create profile
        let profile = InfluencerProfile {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            specialties: spec_strings,
            rate,
            for_donations,
            is_active: true,
            last_updated: current_time,
        };
        
        // Emit enhanced event with timestamp
        event::emit(InfluencerRegistered {
            influencer: tx_context::sender(ctx),
            name: string::utf8(name),
            timestamp: current_time,
        });
        
        // Share profile for discovery
        transfer::share_object(profile);
    }
    
    // Fixed and consolidated promote campaign by influencer function
    public entry fun start_influencer_campaign(
        profile: &InfluencerProfile,
        campaign_id: ID,
        is_paid: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check profile is active
        assert!(profile.is_active, E_INFLUENCER_INACTIVE);
        
        // If this is a donation campaign, check influencer accepts donations
        if (!is_paid) {
            assert!(profile.for_donations, E_INFLUENCER_NO_DONATIONS);
        };
        
        let current_time = clock::timestamp_ms(clock);
        
        // Create promotion
        let promotion = InfluencerCampaign {
            id: object::new(ctx),
            campaign_id,
            influencer_address: profile.owner,
            is_paid,
            is_active: true,
            engagement_timestamp: current_time,
        };
        
        // Emit enhanced event with timestamp and paid status
        event::emit(InfluencerCampaignStarted {
            influencer: profile.owner,
            campaign_id,
            is_paid,
            timestamp: current_time,
        });
        
        // Share the promotion object
        transfer::share_object(promotion);
    }
    
    // === Contributor Functions ===
    
    // Subscribe to campaign with duplicate check
    public entry fun subscribe_to_campaign(
        subscriptions: &mut CampaignSubscriptions,
        campaign_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(subscriptions.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Check if already subscribed
        let i = 0;
        let len = vector::length(&subscriptions.subscriptions);
        let already_subscribed = false;
        
        while (i < len) {
            if (*vector::borrow(&subscriptions.subscriptions, i) == campaign_id) {
                already_subscribed = true;
                break
            };
            i = i + 1;
        };
        
        // Add subscription if not already subscribed
        assert!(!already_subscribed, E_ALREADY_SUBSCRIBED);
        vector::push_back(&mut subscriptions.subscriptions, campaign_id);
        
        // Emit enhanced event with timestamp
        event::emit(SubscribedToCampaign {
            user: tx_context::sender(ctx),
            campaign_id,
            timestamp: current_time,
        });
    }
    
    // Unsubscribe from campaign with better error handling
    public entry fun unsubscribe_from_campaign(
        subscriptions: &mut CampaignSubscriptions,
        campaign_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(subscriptions.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Find the subscription
        let i = 0;
        let len = vector::length(&subscriptions.subscriptions);
        let found_idx = len; // Invalid value by default
        
        while (i < len) {
            if (*vector::borrow(&subscriptions.subscriptions, i) == campaign_id) {
                found_idx = i;
                break
            };
            i = i + 1;
        };
        
        // If found, remove it
        assert!(found_idx < len, E_NOT_SUBSCRIBED);
        vector::remove(&mut subscriptions.subscriptions, found_idx);
        
        // Emit enhanced event with timestamp
        event::emit(UnsubscribedFromCampaign {
            user: tx_context::sender(ctx),
            campaign_id,
            timestamp: current_time,
        });
    }
    
    // === Rate Limiting ===
    
    // Check if action is allowed based on rate limiting
    public entry fun check_rate_limit(
        last_action: &mut LastActionTimestamp,
        clock: &Clock,
        ctx: &mut TxContext
    ): bool {
        // Verify ownership
        assert!(last_action.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        let current_time = clock::timestamp_ms(clock);
        let is_allowed = current_time > last_action.timestamp + COOLDOWN_PERIOD;
        
        if (is_allowed) {
            last_action.timestamp = current_time;
        };
        
        is_allowed
    }
    
    // === View Functions ===
    
    // Get all campaign IDs
    public fun get_all_campaigns(registry: &CampaignRegistry): vector<ID> {
        registry.campaigns
    }
    
    // Get campaign count
    public fun get_campaign_count(registry: &CampaignRegistry): u64 {
        vector::length(&registry.campaigns)
    }
    
    // Get campaigns batch with explicit bounds checking
    public fun get_campaigns_batch(
        registry: &CampaignRegistry,
        start_index: u64,
        count: u64
    ): vector<ID> {
        // Validate input
        assert!(count <= MAX_BATCH_SIZE, E_INVALID_INPUT);
        
        let len = vector::length(&registry.campaigns);
        if (len == 0) {
            return vector::empty()
        };
        
        assert!(start_index < len, E_INVALID_INPUT);
        
        let end_index = start_index + count;
        if (end_index > len) {
            end_index = len;
        };
        
        let result = vector::empty<ID>();
        let i = start_index;
        
        while (i < end_index) {
            vector::push_back(&mut result, *vector::borrow(&registry.campaigns, i));
            i = i + 1;
        };
        
        result
    }
    
    // Get user role
    public fun get_user_role(user: &User): u8 {
        user.role
    }
    
    // Get user's subscribed campaigns
    public fun get_user_subscriptions(subscriptions: &CampaignSubscriptions): vector<ID> {
        subscriptions.subscriptions
    }
    
    // Get user notifications
    public fun get_user_notifications(notifications: &UserNotifications): vector<ID> {
        notifications.notifications
    }
    
    // Get notification count
    public fun get_notification_count(notifications: &UserNotifications): u64 {
        vector::length(&notifications.notifications)
    }

    // === Admin Functions ===

    // Remove campaign from registry -- only admin/owner
    public entry fun remove_campaign(
        registry: &mut CampaignRegistry,
        campaign_id: ID,
        ctx: &mut TxContext
    ) {
        // In a real implementation, this would check if the caller is an admin
        // For demonstration, we're using a simplified approach
        let sender = tx_context::sender(ctx);
        assert!(sender == @suifunder, E_UNAUTHORIZED);
        
        let i = 0;
        let len = vector::length(&registry.campaigns);
        let found_idx = len; // Invalid value by default
        
        while (i < len) {
            if (*vector::borrow(&registry.campaigns, i) == campaign_id) {
                found_idx = i;
                break
            };
            i = i + 1;
        };
        
        // If found, remove it
        if (found_idx < len) {
            vector::remove(&mut registry.campaigns, found_idx);
        } else {
            assert!(false, E_INVALID_INPUT);
        }
    }

    // === Enhanced notification handling for frontend integration ===

    // Add a notification to a user's notification box
    public entry fun add_notification_to_user(
        notifications: &mut UserNotifications,
        notification_id: ID,
        _ctx: &mut TxContext
    ) {
        // Limit the number of notifications to prevent DoS
        assert!(
            vector::length(&notifications.notifications) < MAX_NOTIFICATIONS, 
            E_MAX_NOTIFICATIONS_REACHED
        );
        
        // Add notification ID to user's notifications
        vector::push_back(&mut notifications.notifications, notification_id);
    }
    
    // Clear a user's notifications
    public entry fun clear_notifications(
        notifications: &mut UserNotifications,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(notifications.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        // Clear all notifications
        while (!vector::is_empty(&notifications.notifications)) {
            vector::pop_back(&mut notifications.notifications);
        };
    }
    
    // Get influencer profile details
    public fun get_influencer_details(
        profile: &InfluencerProfile
    ): (address, String, String, vector<String>, u64, bool, bool) {
        (
            profile.owner,
            profile.name,
            profile.description,
            profile.specialties,
            profile.rate,
            profile.for_donations,
            profile.is_active
        )
    }
}
