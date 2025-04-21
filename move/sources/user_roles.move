
module suifunder::user_roles {
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::option;
    
    // User roles
    const ROLE_CREATOR: u8 = 0;
    const ROLE_CONTRIBUTOR: u8 = 1;
    const ROLE_INFLUENCER: u8 = 2;
    
    // Errors
    const E_UNAUTHORIZED: u64 = 0;
    const E_INVALID_ROLE: u64 = 1;
    
    // User profile
    struct UserProfile has key, store {
        id: UID,
        owner: address,
        role: u8,
        name: String,
        bio: option::Option<String>,
        registered_at: u64,
        campaign_count: u64,
        contribution_count: u64,
    }
    
    // Events
    struct UserRegistered has copy, drop {
        user: address,
        role: u8,
        name: String,
    }
    
    struct UserProfileUpdated has copy, drop {
        user: address,
        name: String,
    }
    
    // Register a new user
    public entry fun register_user(
        role: u8,
        name: vector<u8>,
        bio: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate role
        assert!(
            role == ROLE_CREATOR || role == ROLE_CONTRIBUTOR || role == ROLE_INFLUENCER,
            E_INVALID_ROLE
        );
        
        // Create profile
        let profile = UserProfile {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            role,
            name: string::utf8(name),
            bio: option::some(string::utf8(bio)),
            registered_at: clock::timestamp_ms(clock),
            campaign_count: 0,
            contribution_count: 0,
        };
        
        // Emit event
        event::emit(UserRegistered {
            user: tx_context::sender(ctx),
            role,
            name: string::utf8(name),
        });
        
        // Transfer profile to owner
        transfer::transfer(profile, tx_context::sender(ctx));
    }
    
    // Update user profile
    public entry fun update_profile(
        profile: &mut UserProfile,
        name: vector<u8>,
        bio: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(profile.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        // Update fields
        profile.name = string::utf8(name);
        profile.bio = option::some(string::utf8(bio));
        
        // Emit event
        event::emit(UserProfileUpdated {
            user: tx_context::sender(ctx),
            name: string::utf8(name),
        });
    }
    
    // Increment campaign count
    public fun increment_campaign_count(profile: &mut UserProfile) {
        profile.campaign_count = profile.campaign_count + 1;
    }
    
    // Increment contribution count
    public fun increment_contribution_count(profile: &mut UserProfile) {
        profile.contribution_count = profile.contribution_count + 1;
    }
    
    // Get user role
    public fun get_user_role(profile: &UserProfile): u8 {
        profile.role
    }
    
    // Check if user is creator
    public fun is_creator(profile: &UserProfile): bool {
        profile.role == ROLE_CREATOR
    }
    
    // Check if user is contributor
    public fun is_contributor(profile: &UserProfile): bool {
        profile.role == ROLE_CONTRIBUTOR
    }
    
    // Check if user is influencer
    public fun is_influencer(profile: &UserProfile): bool {
        profile.role == ROLE_INFLUENCER
    }
}
