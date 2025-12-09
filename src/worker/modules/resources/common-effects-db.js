import {gameEffects, gameEntity} from "game-framework";

export const registerCommomEffects = () => {

    gameEffects.registerEffect('rest_efficiency', {
        name: 'Rest Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases amount of resources recovered while performing resting actions'
    })

    gameEffects.registerEffect('begging_efficiency', {
        name: 'Begging Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases effectiveness of "Begging" action'
    })

    gameEffects.registerEffect('clean_stable_efficiency', {
        name: 'Clean Stable Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases effectiveness of "Clean Stable" action'
    })

    gameEffects.registerEffect('gathering_efficiency', {
        name: 'Gathering Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases amount of gathering effort produced by gathering actions'
    })

    gameEffects.registerEffect('expedition_efficiency', {
        name: 'Expedition Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases effectiveness of expedition'
    })

    gameEffects.registerEffect('expedition_xp_rate', {
        name: 'Expedition XP Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to XP gained from expeditions'
    })

    gameEffects.registerEffect('expedition_resource_amount', {
        name: 'Expedition Resource Amount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to amount of resources found during expeditions'
    })

    gameEffects.registerEffect('enchanted_paper_mana_discount', {
        name: 'Enchanted Paper Mana Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Discount to mana cost when crafting enchanted paper'
    })

    gameEffects.registerEffect('gathering_perception', {
        name: 'Gathering Perception',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases probability of finding loot on maps (has diminish return)',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('gathering_low_chance', {
        name: 'Low Rarity Gather Prob.',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to the chance of regular drop finds',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('gathering_herbs_amount', {
        name: 'Herbs Gathered',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to amount of herbs that can be found on maps'
    })

    gameEffects.registerEffect('hunting_amount_multiplier', {
        name: 'Hunt Resources Mult',
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to amount of resources that can be received from hunt'
    })

    gameEffects.registerEffect('read_books_efficiency', {
        name: 'Read Books Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases output of "Read Books" action'
    })

    gameEffects.registerEffect('learn_languages_efficiency', {
        name: 'Learn Languages Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases effectiveness of Learn Languages action'
    })

    gameEffects.registerEffect('plain_learn_rate', {
        name: 'Plain Learn Bonus',
        tags: ['multiplier'],
        description: 'Flat bonus to XP gained while running any action (additive, not multiplicative)',
        defaultValue: 0,
        minValue: 0,
    })

    gameEffects.registerEffect('books_learning_rate', {
        name: 'Read Books Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tag "book"'
    })

    gameEffects.registerEffect('spiritual_learning_rate', {
        name: 'Spiritual Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tag "spiritual"'
    })

    gameEffects.registerEffect('mental_training_learning_rate', {
        name: 'Mental Training Learning',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tags "mental" and "training"'
    })

    gameEffects.registerEffect('social_training_learning_rate', {
        name: 'Social Training Learning',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tags "social" and "training"'
    })

    gameEffects.registerEffect('max_focus_time', {
        name: 'Max focus time',
        defaultValue: 300.,
        minValue: 300,
        description: 'Maximum duration you can maintain focus before needing rest'
    })

    gameEffects.registerEffect('coins_earned_bonus', {
        name: 'Coins Earning Bonus',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to coins earned from various activities'
    })

    gameEffects.registerEffect('physical_training_learn_speed', {
        name: 'Physical Training Learning',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tags "physical" and "training"'
    })

    gameEffects.registerEffect('routine_learning_speed', {
        name: 'Routine Learning',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tag "routine"',
        unlockCondition: () => {
            return gameEntity.isEntityUnlocked('action_home_errands')
        }
    })

    gameEffects.registerEffect('yoga_learn_speed', {
        name: 'Yoga Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by Yoga practices'
    })

    gameEffects.registerEffect('manual_labor_efficiency', {
        name: 'Manual Labor Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increase productivity of all actions with tag "manual-labour"'
    })

    gameEffects.registerEffect('job_learning_rate', {
        name: 'Jobs Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increase amount of XP per second obtained by all actions with tag "job"'

    })

    gameEffects.registerEffect('mental_activities_learn_rate', {
        name: 'Mental Activities Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increase amount of XP per second obtained by all mental activities actions',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('crafting_efficiency', {
        name: 'Crafting Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increasing output of all crafting recipes.'
    })

    gameEffects.registerEffect('alchemy_efficiency', {
        name: 'Alchemy Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increasing output of all alchemy recipes.',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('learning_rate', {
        name: 'Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by any action. Also increase mage XP gains from actions.'
    })

    gameEffects.registerEffect('walking_learning_rate', {
        name: 'Walking Learning Rate',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by Walking action'
    })


    gameEffects.registerEffect('shop_max_stock', {
        name: 'Inventory Sell Cap',
        tags: ['multiplier'],
        defaultValue: 100,
        minValue: 100,
        description: 'Maximum amount of items of same type that can be sold'
    })

    gameEffects.registerEffect('prices_discount', {
        name: 'Price Discount Multiplier',
        tags: ['multiplier'],
        defaultValue: 1,
        minValue: 1,
        description: 'Purchase price reduction'
    })

    gameEffects.registerEffect('shop_stock_renew_rate', {
        name: 'Inventory Sell Renew Rate',
        tags: ['multiplier'],
        defaultValue: 1,
        minValue: 1,
        description: 'Rate at which possible amount of items can be sold renews'
    })

    gameEffects.registerEffect('guild_reputation_rate', {
        name: 'Guild Reputation Rate',
        defaultValue: 1,
        minValue: 1,
        description: 'Multiplier to guild reputation gained from actions'
    })

    // Aspects
    gameEffects.registerEffect('aspect_attribute_strength', {
        name: 'Physical Intensity',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('aspect_attribute_charisma', {
        name: 'Social Intensity',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('aspect_attribute_patience', {
        name: 'Patience Intensity',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('aspect_attribute_magic_capability', {
        name: 'Magical Intensity',
        defaultValue: 1.,
        minValue: 1.,
    })

    // Intensity Price Reductions
    gameEffects.registerEffect('aspect_attribute_strength_reduction', {
        name: 'Physical Intensity Mult.',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('aspect_attribute_charisma_reduction', {
        name: 'Social Intensity Mult.',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('aspect_attribute_patience_reduction', {
        name: 'Patience Intensity Mult.',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('aspect_attribute_magic_capability_reduction', {
        name: 'Magic Intensity Mult.',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('courses_knowledge_discount', {
        name: 'Courses Knowledge Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Reduces amount of knowledge consumed by learning courses'
    })

    gameEffects.registerEffect('social_actions_discount', {
        name: 'Social XP Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Reduce XP required to level-up actions with tag "social"'
    })

    gameEffects.registerEffect('physical_actions_discount', {
        name: 'Physical XP Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Reduce XP required to level-up actions with tag "physical"'
    })

    gameEffects.registerEffect('mental_actions_discount', {
        name: 'Mental XP Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Reduce XP required to level-up actions with tag "mental"'
    })

    gameEffects.registerEffect('magical_actions_discount', {
        name: 'Magical XP Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Reduce XP required to level-up actions with tag "magical"'
    })

    gameEffects.registerEffect('routine_actions_discount', {
        name: 'Routine XP Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Reduce XP required to level-up actions with tag "routine"'
    })

    gameEffects.registerEffect('courses_learning_speed', {
        name: 'Courses Learning Speed',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases learning speed for all courses'
    })

    gameEffects.registerEffect('press_learning_speed', {
        name: 'Press Learning Speed',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases leveling speed for all press journals'
    })

    gameEffects.registerEffect('reductive_courses_power', {
        name: 'Reductive Courses Power',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases effectiveness of courses that reduce other requirements (the ones that tagged with "reductive")'
    })

    gameEffects.registerEffect('max_map_level', {
        name: 'Max Map Level',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Maximum level of exploration map that can be generated'
    })

    gameEffects.registerEffect('max_wells', {
        name: 'Max Wells',
        tags: ['multiplier'],
        defaultValue: 0.,
        minValue: 0.,
        description: 'Maximum number of wells you can build'
    })

    gameEffects.registerEffect('max_wells_per_water_pump', {
        name: 'Max Wells Per Water Pump',
        tags: ['multiplier'],
        defaultValue: 0.,
        minValue: 0.,
        description: 'Maximum wells that can be built per Water Pump (value x Water Pump Level)'
    })

    gameEffects.registerEffect('spell_xp_rate', {
        name: 'Spell XP Gain',
        tags: ['multiplier'],
        description: 'Increase amount of XP, received by spell per cast. The more spell XP you gain - the faster you\'ll reach next level',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('restoration_spells_efficiency', {
        name: 'Restoration Magic Efficiency',
        tags: ['multiplier'],
        description: 'Increase output of spells with tag "restoration"',
        defaultValue: 1,
        minValue: 1,
    })


    gameEffects.registerEffect('recovery_spells_efficiency', {
        name: 'Recovery Magic Efficiency',
        tags: ['multiplier'],
        description: 'Increase output of spells with tag "recovery"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('illusion_spells_efficiency', {
        name: 'Illusion Magic Efficiency',
        tags: ['multiplier'],
        description: 'Increase output of spells with tag "illusion"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('conjuration_spells_efficiency', {
        name: 'Conjuration Magic Efficiency',
        tags: ['multiplier'],
        description: 'Increase output of spells with tag "conjuration"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('elemental_spells_efficiency', {
        name: 'Elemental Magic Efficiency',
        tags: ['multiplier'],
        description: 'Increase output of spells with tag "elemental"',
        defaultValue: 1,
        minValue: 1,
    })

    // Accessories tag-based efficiency
    gameEffects.registerEffect('tome_accessories_efficiency', {
        name: 'Tome Accessories Efficiency',
        tags: ['multiplier'],
        description: 'Increases effects provided by accessories with tag "tome"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('device_accessories_efficiency', {
        name: 'Device Accessories Efficiency',
        tags: ['multiplier'],
        description: 'Increases effects provided by accessories with tag "device"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('accessory_jewelry_efficiency', {
        name: 'Jewelry Accessories Efficiency',
        tags: ['multiplier'],
        description: 'Increases effects provided by accessories with tag "jewelry"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('nature_spells_efficiency', {
        name: 'Nature Magic Efficiency',
        tags: ['multiplier'],
        description: 'Increase output of spells with tag "nature"',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('plantations_efficiency', {
        name: 'Plantations Efficiency',
        tags: ['multiplier'],
        description: 'Increase plantations yield',
        defaultValue: 1,
        minValue: 1
    })

    gameEffects.registerEffect('plantations_max_watering', {
        name: 'Max Watering Level',
        tags: ['multiplier'],
        description: 'Determines maximum level of watering you can assign to single plantation. The greater level - the more water you spent, but your plantations get greater yield',
        defaultValue: 0,
        minValue: 0
    })

    gameEffects.registerEffect('land_purchase_discount', {
        name: 'Land Discount',
        tags: ['multiplier'],
        defaultValue: 1,
        minValue: 1,
        description: 'Reduces cost of purchasing new land plots'
    })

    gameEffects.registerEffect('urn_storage_bonus', {
        name: 'Urns storage bonus',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
        description: 'Increase amount of coins that can be stored in your urns'
    })

    gameEffects.registerEffect('drying_rack_efficiency', {
        name: 'Drying Rack Efficiency',
        tags: ['multiplier'],
        description: 'Increases the efficiency of Herbalist\'s Drying Rack',
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
    })

    gameEffects.registerEffect('crafting_materials_discount', {
        name: 'Crafting Materials Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Decrease resources consumed by crafting recipes'
    })

    gameEffects.registerEffect('alchemy_materials_discount', {
        name: 'Alchemy Materials Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Decrease resources consumed by alchemical recipes'
    })

    gameEffects.registerEffect('alchemy_mana_discount', {
        name: 'Alchemy Mana Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Reduce mana consumption for alchemy recipes'
    })

    gameEffects.registerEffect('amplifier_cost_reduction', {
        name: 'Amplifier Cost Reduction',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Decrease cost of amplifiers'
    })

    gameEffects.registerEffect('earth_amplifier_efficiency', {
        name: 'Earth Amplifier Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Increase bonuses that you are getting from earth amplifiers'
    })

    gameEffects.registerEffect('air_amplifier_efficiency', {
        name: 'Air Amplifier Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Increase bonuses that you are getting from air amplifiers'
    })

    gameEffects.registerEffect('fire_amplifier_efficiency', {
        name: 'Fire Amplifier Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Increase bonuses that you are getting from fire amplifiers'
    })

    gameEffects.registerEffect('trade_warehouse_coins_cap_bonus', {
        name: 'Trade Warehouse Coins Cap Bonus',
        tags: ['multiplier'],
        defaultValue: 0.,
        minValue: 0.,
        hasCap: false,
        saveBalanceTree: false,
        description: 'Increase bonus to coin cap, provided by Trade Warehouse'
    })

    gameEffects.registerEffect('map_generation_discount', {
        name: 'Map Generation Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Decrease amount of resources required for map generation'
    })

    gameEffects.registerEffect('crafting_effort', {
        name: 'Crafting Effort',
        tags: ['multiplier'],
        defaultValue: 0.02,
        minValue: 0.02,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Increase maximum crafting speed, increasing both input and output of crafting recipes'
    })

    gameEffects.registerEffect('alchemy_effort', {
        name: 'Alchemy Effort',
        tags: ['multiplier'],
        defaultValue: 0.02,
        minValue: 0.02,
        hasCap: false,
        saveBalanceTree: true,
        description: 'Increase maximum alchemy speed, increasing both input and output of alchemy recipes'
    })

    gameEffects.registerEffect('job_efficiency_social', {
        name: 'Social Jobs Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Determines how efficient you would be in social jobs'

    })

    gameEffects.registerEffect('job_efficiency_physical', {
        name: 'Physical Jobs Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Determines how efficient you would be in physical jobs'

    })

    gameEffects.registerEffect('job_efficiency_magical', {
        name: 'Magical Jobs Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Determines how efficient you would be in magical jobs'

    })

    gameEffects.registerEffect('industrial_efficiency', {
        name: 'Industrial Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Determines how efficient industrial facilities like Lumber Mill operate'
    })

    gameEffects.registerEffect('lumbermill_efficiency', {
        name: 'Lumbermill Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Determines how efficient Lumbermill operates'
    })

    gameEffects.registerEffect('mining_efficiency', {
        name: 'Mining Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Determines how efficient mining operations are'
    })

    gameEffects.registerEffect('mining_machinery_efficiency', {
        name: 'Mining Machinery Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases efficiency of automated mining machinery and processing plants'
    })

    gameEffects.registerEffect('tinkers_shed_crafting_bonus', {
        name: 'Tinker\'s Shed Crafting Bonus',
        tags: ['multiplier'],
        description: 'Increases the crafting efficiency bonus from Tinker\'s Shed',
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
    })

    gameEffects.registerEffect('tinkers_shed_alchemy_bonus', {
        name: 'Tinker\'s Shed Alchemy Bonus',
        tags: ['multiplier'],
        description: 'Increases the alchemy efficiency bonus from Tinker\'s Shed',
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
    })

    gameEffects.registerEffect('trade_stall_social_learning_bonus', {
        name: 'Trade Stall Social Learning Bonus',
        tags: ['multiplier'],
        description: 'Increases social training rate from trade stalls',
        defaultValue: 0.,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('trade_stall_knowledge_bonus', {
        name: 'Trade Stall Knowledge Bonus',
        tags: ['multiplier'],
        description: 'Increases knowledge gain from trade stalls',
        defaultValue: 0.,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('magic_library_magic_discount', {
        name: 'Magic Library Spiritual Learning Bonus',
        tags: ['multiplier'],
        description: 'Increases spiritual learning rate from magic libraries',
        defaultValue: 0.,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('library_knowledge_cap_bonus', {
        name: 'Library Knowledge Cap Bonus',
        tags: ['multiplier'],
        description: 'Increases knowledge capacity bonus from library',
        defaultValue: 0.,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('stone_hut_max_level_bonus', {
        name: 'Stone Hut Max Level Bonus',
        tags: ['multiplier'],
        description: 'Increases the maximum level of Stone Hut',
        defaultValue: 0,
        minValue: 0,
        hasCap: false,
    })

    // Max level bonuses for specific structures
    gameEffects.registerEffect('stone_workshop_max_level_bonus', {
        name: 'Stone Workshop Max Level Bonus',
        tags: ['multiplier'],
        description: 'Additional max levels for Stone Workshop provided by other buildings',
        defaultValue: 0,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('dry_storage_max_level_bonus', {
        name: 'Dry Storage Max Level Bonus',
        tags: ['multiplier'],
        description: 'Additional max levels for Dry Storage provided by other buildings',
        defaultValue: 0,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('mining_processing_plant_max_level_bonus', {
        name: 'Mining Processing Plant Max Level Bonus',
        tags: ['multiplier'],
        description: 'Additional max levels for Mining Processing Plant',
        defaultValue: 0,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('rare_plants_on_map', {
        name: 'Rare Plants on Map',
        tags: ['multiplier'],
        description: 'Increases the chance to find rare plants during exploration',
        defaultValue: 1,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('masters_table_efficiency', {
        name: 'Master\'s Table Efficiency',
        tags: ['multiplier'],
        description: 'Increases the efficiency of Master\'s Table furniture',
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
    })

    gameEffects.registerEffect('masters_table_workbench_bonus', {
        name: 'Master\'s Table Workbench Bonus',
        tags: ['multiplier'],
        description: 'Provides additional bonus to Master\'s Table efficiency from Tool Workshop',
        defaultValue: 0.,
        minValue: 0,
        hasCap: false,
    })

    gameEffects.registerEffect('training_social_effects_efficiency', {
        name: 'Training Event Hall Effects',
        tags: ['multiplier'],
        description: 'Increases the permanent effect of Event Hall social events with training tag',
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
    })

    gameEffects.registerEffect('machinery_efficiency', {
        name: 'Machinery Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases efficiency of all machinery',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('socio_campaign_efficiency', {
        name: 'Social Campaign Permanent Bonus',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases passive bonus of event hall events tagged "socio_campaign"',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('accessories_discount', {
        name: 'Accessories Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Decrease price of all accessories',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('artifact_scroll_efficiency', {
        name: 'Scroll Accessories Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1,
        description: 'Increases the effectiveness of artifact scroll accessories',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('coal_consumption_discount', {
        name: 'Coal Consumption Discount',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 0.1,
        description: 'Reduces coal consumption by machinery and industrial equipment',
        saveBalanceTree: true,
    })

    // Zoo related bonuses
    gameEffects.registerEffect('zoo_animals_efficiency', {
        name: 'Zoo Animals Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases the effective efficiency of fed zoo animals (affects growth rates)',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('breeding_efficiency', {
        name: 'Breeding Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases the breeding speed of all zoo animals',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('birds_breeding_efficiency', {
        name: 'Birds Breeding Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases breeding efficiency for birds in the magical zoo',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('mammal_breeding_efficiency', {
        name: 'Mammal Breeding Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases breeding efficiency for mammals in the magical zoo',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('reptile_breeding_efficiency', {
        name: 'Reptile Breeding Efficiency',
        tags: ['multiplier'],
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increases breeding efficiency for reptiles in the magical zoo',
        saveBalanceTree: true,
    })


}