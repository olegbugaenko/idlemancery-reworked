import {gameEffects} from "game-framework";

export const registerCommomEffects = () => {

    gameEffects.registerEffect('rest_efficiency', {
        name: 'Rest Efficiency',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('begging_efficiency', {
        name: 'Begging Efficiency',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('clean_stable_efficiency', {
        name: 'Clean Stable Efficiency',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('gathering_efficiency', {
        name: 'Gathering Efficiency',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('gathering_perception', {
        name: 'Gathering Perception',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('gathering_low_chance', {
        name: 'Low Rarity Gather Prob.',
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to the chance of regular drop finds',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('gathering_herbs_amount', {
        name: 'Herbs Gathered',
        defaultValue: 1.,
        minValue: 1,
        description: 'Multiplier to amount of herbs that can be found'
    })

    gameEffects.registerEffect('read_books_efficiency', {
        name: 'Read Books Efficiency',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('plain_learn_rate', {
        name: 'Plain Learn Bonus',
        description: 'Raw bonus to XP gained to action (not multiplied by other multipliers)',
        defaultValue: 0,
        minValue: 0,
    })

    gameEffects.registerEffect('books_learning_rate', {
        name: 'Read Books Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tag "book"'
    })

    gameEffects.registerEffect('spiritual_learning_rate', {
        name: 'Spiritual Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tag "spiritual"'
    })

    gameEffects.registerEffect('mental_training_learning_rate', {
        name: 'Mental Training Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tags "mental" and "training"'
    })

    gameEffects.registerEffect('social_training_learning_rate', {
        name: 'Social Training Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tags "social" and "training"'
    })

    gameEffects.registerEffect('max_focus_time', {
        name: 'Max focus time',
        defaultValue: 300.,
        minValue: 300,
    })

    gameEffects.registerEffect('coins_earned_bonus', {
        name: 'Coins Earning Bonus',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('physical_training_learn_speed', {
        name: 'Physical Training Learning',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tags "physical" and "training"'
    })

    gameEffects.registerEffect('routine_learning_speed', {
        name: 'Routine Learning',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions with tag "routine"'
    })

    gameEffects.registerEffect('yoga_learn_speed', {
        name: 'Yoga Learning Rate',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by Yoga practices'
    })

    gameEffects.registerEffect('manual_labor_efficiency', {
        name: 'Manual Labor Efficiency',
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increase productivity of all actions with tag "manual-labour"'
    })

    gameEffects.registerEffect('job_learning_rate', {
        name: 'Jobs Learning Rate',
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increase amount of XP per second obtained by all actions with tag "job"'

    })

    gameEffects.registerEffect('mental_activities_learn_rate', {
        name: 'Mental Activities Learning Rate',
        defaultValue: 1.,
        minValue: 1.,
        description: 'Increase amount of XP per second obtained by all mental activities actions',
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('crafting_efficiency', {
        name: 'Crafting Efficiency',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('alchemy_efficiency', {
        name: 'Alchemy Efficiency',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('learning_rate', {
        name: 'Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by all actions'
    })

    gameEffects.registerEffect('walking_learning_rate', {
        name: 'Walking Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
        description: 'Increase amount of XP per second obtained by Walking action'
    })


    gameEffects.registerEffect('shop_max_stock', {
        name: 'Shop Max Sell Stock',
        defaultValue: 100,
        minValue: 100,
        description: 'Maximum amount of items of same type that can be sold'
    })

    gameEffects.registerEffect('prices_discount', {
        name: 'Price Discount Multiplier',
        defaultValue: 1,
        minValue: 1,
        description: 'Purchase price reduction'
    })

    gameEffects.registerEffect('shop_stock_renew_rate', {
        name: 'Sell Stock Renew Rate',
        defaultValue: 1,
        minValue: 1,
        description: 'Rate at which possible amount of items can be sold renews'
    })

    gameEffects.registerEffect('guild_reputation_rate', {
        name: 'Guild Reputation Rate',
        defaultValue: 1,
        minValue: 1
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

    gameEffects.registerEffect('courses_knowledge_discount', {
        name: 'Courses Knowledge Discount',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('social_actions_discount', {
        name: 'Social XP Discount',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('physical_actions_discount', {
        name: 'Physical XP Discount',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('mental_actions_discount', {
        name: 'Mental XP Discount',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('magical_actions_discount', {
        name: 'Magical XP Discount',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('routine_actions_discount', {
        name: 'Routine XP Discount',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('courses_learning_speed', {
        name: 'Courses Learning Speed',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('reductive_courses_power', {
        name: 'Reductive Courses Power',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('max_map_level', {
        name: 'Max Map Level',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('spell_xp_rate', {
        name: 'Spell XP Gain',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('restoration_spells_efficiency', {
        name: 'Restoration Magic Efficiency',
        defaultValue: 1,
        minValue: 1,
    })


    gameEffects.registerEffect('recovery_spells_efficiency', {
        name: 'Recovery Magic Efficiency',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('illusion_spells_efficiency', {
        name: 'Illusion Magic Efficiency',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('conjuration_spells_efficiency', {
        name: 'Conjuration Magic Efficiency',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('elemental_spells_efficiency', {
        name: 'Elemental Magic Efficiency',
        defaultValue: 1,
        minValue: 1,
    })

    gameEffects.registerEffect('plantations_efficiency', {
        name: 'Plantations Efficiency',
        defaultValue: 1,
        minValue: 1
    })

    gameEffects.registerEffect('plantations_max_watering', {
        name: 'Max Watering Level',
        description: 'Determines maximum level of watering you can assign to single plantation. The greater level - the more water you spent, but your plantations get greater yield',
        defaultValue: 0,
        minValue: 0
    })

    gameEffects.registerEffect('land_purchase_discount', {
        name: 'Land Discount',
        defaultValue: 1,
        minValue: 1
    })

    gameEffects.registerEffect('urn_storage_bonus', {
        name: 'Urns storage bonus',
        defaultValue: 1.,
        minValue: 1,
        hasCap: false,
    })
}