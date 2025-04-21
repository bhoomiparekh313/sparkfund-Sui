
module suifunder::objects {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use sui::transfer;
    
    // Stores campaign metadata
    struct CampaignMetadata has key, store {
        id: UID,
        title: String,
        description: String,
        image_url: String,
        details_url: Option<String>,
        category: String,
        tags: vector<String>,
        created_at: u64,
        updated_at: u64,
    }
    
    // Stores campaign stats
    struct CampaignStats has key, store {
        id: UID,
        views: u64,
        shares: u64,
        favorites: u64,
    }
    
    // Donor receipt - provided to donors as proof of donation
    struct DonorReceipt has key {
        id: UID,
        campaign_id: address,
        donor: address,
        amount: u64,
        timestamp: u64,
        message: Option<String>,
    }
    
    // Campaign Update - allows creators to post updates about their campaign
    struct CampaignUpdate has key, store {
        id: UID,
        campaign_id: address,
        title: String,
        content: String,
        timestamp: u64,
        media_urls: vector<String>,
    }
    
    // Campaign Updates List - stores all updates for a campaign
    struct CampaignUpdates has key {
        id: UID,
        campaign_id: address,
        updates: vector<address>,
    }
    
    // Creates and returns campaign metadata
    public fun create_metadata(
        title: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        details_url: Option<vector<u8>>,
        category: vector<u8>,
        tags: vector<vector<u8>>,
        timestamp: u64,
        ctx: &mut TxContext
    ): CampaignMetadata {
        // Convert vector tags to string tags
        let string_tags = vector::empty<String>();
        let i = 0;
        let len = vector::length(&tags);
        
        while (i < len) {
            let tag = vector::borrow(&tags, i);
            vector::push_back(&mut string_tags, string::utf8(*tag));
            i = i + 1;
        };
        
        // Convert optional details_url
        let string_details_url = if (option::is_some(&details_url)) {
            option::some(string::utf8(option::extract(&mut details_url)))
        } else {
            option::none()
        };
        
        CampaignMetadata {
            id: object::new(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            image_url: string::utf8(image_url),
            details_url: string_details_url,
            category: string::utf8(category),
            tags: string_tags,
            created_at: timestamp,
            updated_at: timestamp,
        }
    }
    
    // Creates and returns campaign stats
    public fun create_stats(ctx: &mut TxContext): CampaignStats {
        CampaignStats {
            id: object::new(ctx),
            views: 0,
            shares: 0,
            favorites: 0,
        }
    }
    
    // Creates a donor receipt
    public fun create_donor_receipt(
        campaign_id: address,
        donor: address,
        amount: u64,
        timestamp: u64,
        message: Option<vector<u8>>,
        ctx: &mut TxContext
    ): DonorReceipt {
        let string_message = if (option::is_some(&message)) {
            option::some(string::utf8(option::extract(&mut message)))
        } else {
            option::none()
        };
        
        DonorReceipt {
            id: object::new(ctx),
            campaign_id,
            donor,
            amount,
            timestamp,
            message: string_message,
        }
    }
    
    // Creates and sends a donor receipt to a donor
    public fun send_donor_receipt(
        campaign_id: address,
        donor: address,
        amount: u64,
        timestamp: u64,
        message: Option<vector<u8>>,
        ctx: &mut TxContext
    ) {
        let receipt = create_donor_receipt(
            campaign_id,
            donor,
            amount,
            timestamp,
            message,
            ctx
        );
        
        transfer::transfer(receipt, donor);
    }
    
    // Creates a campaign update
    public fun create_campaign_update(
        campaign_id: address,
        title: vector<u8>,
        content: vector<u8>,
        timestamp: u64,
        media_urls: vector<vector<u8>>,
        ctx: &mut TxContext
    ): CampaignUpdate {
        // Convert vector media_urls to string media_urls
        let string_media_urls = vector::empty<String>();
        let i = 0;
        let len = vector::length(&media_urls);
        
        while (i < len) {
            let url = vector::borrow(&media_urls, i);
            vector::push_back(&mut string_media_urls, string::utf8(*url));
            i = i + 1;
        };
        
        CampaignUpdate {
            id: object::new(ctx),
            campaign_id,
            title: string::utf8(title),
            content: string::utf8(content),
            timestamp,
            media_urls: string_media_urls,
        }
    }
    
    // Creates and initializes campaign updates list
    public fun initialize_campaign_updates(
        campaign_id: address,
        ctx: &mut TxContext
    ): CampaignUpdates {
        CampaignUpdates {
            id: object::new(ctx),
            campaign_id,
            updates: vector::empty(),
        }
    }
    
    // Adds an update to campaign updates list
    public fun add_campaign_update(
        updates: &mut CampaignUpdates,
        update_id: address,
    ) {
        vector::push_back(&mut updates.updates, update_id);
    }
}
