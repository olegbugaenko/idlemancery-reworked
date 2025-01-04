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
    })

    gameEffects.registerEffect('gathering_low_chance', {
        name: 'Low Rarity Gather Prob.',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('gathering_herbs_amount', {
        name: 'Herbs Gathered',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('read_books_efficiency', {
        name: 'Read Books Efficiency',
        defaultValue: 1.,
        minValue: 1,
    })

    gameEffects.registerEffect('books_learning_rate', {
        name: 'Read Books Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('spiritual_learning_rate', {
        name: 'Spiritual Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('mental_training_learning_rate', {
        name: 'Mental Training Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('social_training_learning_rate', {
        name: 'Social Training Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
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
    })

    gameEffects.registerEffect('routine_learning_speed', {
        name: 'Routine Learning',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('yoga_learn_speed', {
        name: 'Yoga Learning Rate',
        defaultValue: 1.,
        minValue: 1.,
        saveBalanceTree: true,
    })

    gameEffects.registerEffect('manual_labor_efficiency', {
        name: 'Manual Labor Efficiency',
        defaultValue: 1.,
        minValue: 1.,
    })

    gameEffects.registerEffect('job_learning_rate', {
        name: 'Jobs Learning Rate',
        defaultValue: 1.,
        minValue: 1.,
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
    })

    gameEffects.registerEffect('walking_learning_rate', {
        name: 'Walking Learning Rate',
        defaultValue: 1.,
        minValue: 1,
        saveBalanceTree: true,
    })


    gameEffects.registerEffect('shop_max_stock', {
        name: 'Shop Max Sell Stock',
        defaultValue: 100,
        minValue: 100
    })

    gameEffects.registerEffect('prices_discount', {
        name: 'Price Discount Multiplier',
        defaultValue: 1,
        minValue: 1
    })

    gameEffects.registerEffect('shop_stock_renew_rate', {
        name: 'Sell Stock Renew Rate',
        defaultValue: 1,
        minValue: 1
    })

    gameEffects.registerEffect('guild_reputation_rate', {
        name: 'Guild Reputation Rate',
        defaultValue: 1,
        minValue: 1
    })
}