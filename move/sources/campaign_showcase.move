
module suifunder::campaign_showcase {
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::vec_set::{Self, VecSet};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::vector;
    
    // Error constants
    const E_NOT_ADMIN: u64 = 1;
    const E_ALREADY_FEATURED: u64 = 2;
    const E_NOT_FEATURED: u64 = 3;
    const E_MAX_FEATURED_REACHED: u64 = 4;
    
    // Featured campaign container
    struct FeaturedCampaigns has key {
        id: UID,
        campaigns: VecSet<ID>,
        last_updated: u64,
        max_featured: u64,
    }
    
    // Events for tracking
    struct CampaignFeatured has copy, drop {
        campaign_id: ID,
        admin: address,
        timestamp: u64,
    }
    
    struct CampaignUnfeatured has copy, drop {
        campaign_id: ID,
        admin: address,
        timestamp: u64,
    }
    
    struct FeaturedListUpdated has copy, drop {
        admin: address,
        new_max: u64,
        timestamp: u64,
    }
    
    // Initialize module - called once at deployment
    fun init(ctx: &mut TxContext) {
        // Create initial featured campaigns container
        let featured = FeaturedCampaigns {
            id: object::new(ctx),
            campaigns: vec_set::empty(),
            last_updated: 0,
            max_featured: 10, // Default max featured campaigns
        };
        
        // Share the object so anyone can view featured campaigns
        transfer::share_object(featured);
    }
    
    // Admin only: Add a campaign to featured list
    public entry fun feature_campaign(
        featured: &mut FeaturedCampaigns, 
        campaign_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Only admin can feature campaigns
        assert!(tx_context::sender(ctx) == @suifunder, E_NOT_ADMIN);
        
        // Check if already featured
        assert!(!vec_set::contains(&featured.campaigns, &campaign_id), E_ALREADY_FEATURED);
        
        // Check if we hit the max featured limit
        assert!(vec_set::size(&featured.campaigns) < featured.max_featured, E_MAX_FEATURED_REACHED);
        
        // Add to featured set
        vec_set::insert(&mut featured.campaigns, campaign_id);
        
        // Update timestamp
        featured.last_updated = clock::timestamp_ms(clock);
        
        // Emit event
        event::emit(CampaignFeatured {
            campaign_id,
            admin: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });
    }
    
    // Admin only: Remove a campaign from featured list
    public entry fun unfeature_campaign(
        featured: &mut FeaturedCampaigns,
        campaign_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Only admin can unfeature campaigns
        assert!(tx_context::sender(ctx) == @suifunder, E_NOT_ADMIN);
        
        // Check if featured
        assert!(vec_set::contains(&featured.campaigns, &campaign_id), E_NOT_FEATURED);
        
        // Remove from featured set
        vec_set::remove(&mut featured.campaigns, &campaign_id);
        
        // Update timestamp
        featured.last_updated = clock::timestamp_ms(clock);
        
        // Emit event
        event::emit(CampaignUnfeatured {
            campaign_id,
            admin: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });
    }
    
    // Admin only: Change max featured campaigns
    public entry fun set_max_featured(
        featured: &mut FeaturedCampaigns,
        max: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Only admin can change settings
        assert!(tx_context::sender(ctx) == @suifunder, E_NOT_ADMIN);
        
        // Update max featured
        featured.max_featured = max;
        featured.last_updated = clock::timestamp_ms(clock);
        
        // Emit event
        event::emit(FeaturedListUpdated {
            admin: tx_context::sender(ctx),
            new_max: max,
            timestamp: clock::timestamp_ms(clock),
        });
    }
    
    // View function: Get all featured campaign IDs
    public fun get_featured_campaigns(featured: &FeaturedCampaigns): vector<ID> {
        let result = vector::empty<ID>();
        let keys = vec_set::keys(&featured.campaigns);
        let i = 0;
        let len = vector::length(keys);
        
        while (i < len) {
            vector::push_back(&mut result, *vector::borrow(keys, i));
            i = i + 1;
        };
        
        result
    }
    
    // View function: Check if a campaign is featured
    public fun is_featured(featured: &FeaturedCampaigns, campaign_id: &ID): bool {
        vec_set::contains(&featured.campaigns, campaign_id)
    }
    
    // View function: Get featured count
    public fun get_featured_count(featured: &FeaturedCampaigns): u64 {
        vec_set::size(&featured.campaigns)
    }
    
    // View function: Get max featured limit
    public fun get_max_featured(featured: &FeaturedCampaigns): u64 {
        featured.max_featured
    }
}
