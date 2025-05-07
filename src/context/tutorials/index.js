// Описуємо всі кроки “туру”
const stepsInitial = [
    {
        target: '#tutorial-resources',
        content: 'Here you can see your resources. They\'re used in many activities.',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
    },
    {
        target: '#tutorial-attr-tab',
        content: 'Click here to view your attributes',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#tutorial-attributes',
        content: 'Attributes are your primary character stats. Hover over a specific attribute to see what it does.',
        disableBeacon: true,
        spotlightClicks: true,
        disableOverlayClose: true,
        placement: 'bottom',
        offset: 120,
        floaterProps: {
            // Найнадійніший спосіб задати зсув у Popper v2 – через modifiers:
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 30],
                        // offset: [горизонтальнийЗсув, вертикальнийЗсув]
                    },
                },
            ],
        },
    },
    {
        target: '#tutorial-res-tab',
        content: 'Let\'s switch back to the resources tab.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#actions-list-wrap',
        content: 'Here you can see a list of actions available to you. To progress—by earning resources and improving attributes—you need to perform various actions.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#item_action_walk',
        content: 'Hovering over or clicking specific action will show you its details in the right panel. If you click on the action card - you will be able to pin its details to right sidebar. Click on "Walking" action card to see details.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#item_action_bonuses',
        content: 'Here\'s a list of the action\'s effects you\'ll receive while running it. As you can see, Walking consumes energy.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#item_action_levelup',
        content: 'These are passive, permanent bonuses the action provides when leveled up. Walking consumes energy, but leveling it increases Stamina—which boosts passive energy regeneration. To upgrade an action\'s level, you need to run it.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#activate_action_walk',
        content: 'Click the "Start" button to begin walking and increase your Stamina.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#level_up_indicator_action_walk',
        content: 'Now that the action is running, it\'s gaining XP. When the progress indicator fills up, the action will level up. Each new level requires more XP.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    },
    {
        target: '#tutorial-resources',
        content: 'As you can see, your energy rate has dropped—but don\'t worry. Actions consume energy while running, but as your Stamina increases, your net energy income will improve.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#tutorial-resources',
        content: 'If any of your resources drop below zero, actions (and other things that use them) will run at reduced efficiency.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#item_action_walk',
        content: 'Let\'s wait for your Walk action to level up.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#activate_action_visit_city',
        content: 'Some actions are needed to unlock new content. Run "Visit City" until level 2 to unlock more actions and features.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#level',
        content: 'While running actions, your mage will also gain experience. Each new mage level grants one skill point. Unspent points appear here, and clicking this indicator lets you allocate them.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    },
    {
        target: '.banked-time',
        content: "While you're away (when the game is closed), you accumulate banked time—up to 24 hours, that you can spend to speed up progress when you return.",
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    },
    {
        target: '#shop',
        content: 'Now you can run some actions to earn coins. Don’t forget to visit the shop once you’ve earned 2 coins.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    },
    {
        target: '#goals',
        content: 'If you\'re not sure what to do, check your next unlocks. They\'ll give you a better idea of how to access new content.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    },
    {
        target: '#statistics',
        content: 'You can also click here to view some neat stats about your game.',
        disableOverlayClose: true, // не даємо закрити кліком поза
        spotlightClicks: true
    },
    {
        target: '.how-to',
        content: 'If you feel you not sure how something works - click question mark. It will show you quick interactive tutorial that can be skipped and resumed whenever you want. That’s all for now—good luck!',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    }
];

const stepsActions = [
    {
        target: '.actions-menu',
        content: "Let's dive deeper into actions. As mentioned earlier, actions are key to game progress. For your convenience, we’ve split them into categories.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
    },
    {
        target: '#actions-menu-all',
        content: "We’ll return to navigation soon. For now, let’s select 'All' actions.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
        actionRequired: true,
        spotlightClicks: true,
    },
    {
        target: '.card.action.training',
        content: "Here you can see basic information about your actions, like name, level, and XP requirement. Click an action card to see more details.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
        actionRequired: true,
        spotlightClicks: true,
    },
    {
        target: '#action-tags',
        content: "Each action has tags. Many bonuses in the game apply to actions based on these tags, like 'physical training learning speed' or 'mental activity learning speed'.",
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#action-rank-data',
        content: "Most actions receive a rank every 100 levels, granting a 5% multiplicative boost (Rank boost = 1.05 ^ rank).",
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#item_action_bonuses',
        content: "This is the list of effects granted while running the action. For example, Walking consumes energy.",
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#item_action_levelup',
        content: "These are permanent bonuses received when leveling up the action. Walking consumes energy, but leveling it up increases Stamina, which boosts energy regeneration.",
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#actions-list-wrap',
        content: "Click the 'Start' button to begin running any action.",
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.card.action.active',
        content: "Once an action is running, it starts gaining XP. When the progress bar fills up, the action levels up. Each level requires more XP.",
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
    },
    {
        target: '#tutorial-resources',
        content: "You can now observe changes in your resource balances. Most actions consume specific resources while running.",
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#tutorial-resources',
        content: "If any of your resources drop below zero, actions and features that depend on them will operate less efficiently.",
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.actions-menu',
        content: "Now that we’ve covered how to evaluate actions, let’s return to the navigation menu.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
    },
    {
        target: '.actions-menu .add-custom-filter',
        content: "Over time, your action list will grow. Don’t worry — you can configure tabs to organize them. Click 'Edit Filters'.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#custom-filters-list',
        content: "Here you can view and manage your filters.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
    },
    {
        target: '#add-custom-filter',
        content: "Let’s try creating a new custom filter.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: 'input.filter-name-input',
        content: "Give your filter a name. This name will appear in your filter list and top navigation. Don’t worry, you can change it later.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true,
    },
    {
        target: '.filter-rules .add-rule',
        content: "Set up the filtering rules to determine which actions appear in your list. Click to add a rule.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.filter-rules .custom-filter-rule:nth-of-type(1)',
        content: "Suppose you want a filter tab showing only actions that give a Stamina bonus. Just select 'Gives attribute' in the first input and 'Stamina' in the second dropdown.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.filter-rules .add-rule',
        content: "Let’s say you also want to include actions that grant Charisma. Click to add another rule.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.filter-rules .custom-filter-rule:nth-of-type(2)',
        content: "As before, select 'Gives attribute' and choose 'Charisma' in the second dropdown.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.custom-filter-condition',
        content: "Now that we’ve set up the rules, define the logic to combine them. Enter '1 OR 2' to match actions that meet either condition. You can use more complex logic if needed, like '(1 OR 2) AND (3 OR 4)', but let’s keep it simple for now.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: 'button.save-custom-filter',
        content: "Save your filter by clicking this button.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#custom-filters-list',
        content: "You’ll now see your filter listed here. To make it appear in the top navigation panel, make sure the checkbox next to its name is selected.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'bottom',
    },
    {
        target: '#close-custom-filters-list',
        content: "You can close the custom filters panel using this button.",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#actions-list-wrap',
        content: "That’s everything you need to know about actions. You’ve learned how to inspect, run, and organize them. If you missed something, feel free to revisit this tutorial. Good luck!",
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
    },
]
const stepsActionsLists = [
    {
        target: '#actions-list-wrap',
        content: 'Managing each action individually can be tedious, especially if you plan to be away or want to focus on multiple things. But don’t worry — you can group actions into lists. Let me show you how!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#create-action-list',
        content: 'Let’s create one!',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.action-list-name-input',
        content: 'Give your list a name (you can change it at any time).',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#actions-in-list',
        content: 'Right now your list is empty. You can add actions by clicking or dragging action cards.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.actions-wrap .ingame-box.actions',
        content: 'Find and click the "Walking" and "Beggar" actions to add them to the list.',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'right',
        spotlightClicks: true,
        actionRequired: true,
        floaterProps: {
            placement: 'right',
            modifiers: [
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: [],
                    },
                },
                {
                    name: 'preventOverflow',
                    enabled: false
                },
                {
                    name: 'offset',
                    options: {
                        offset: [0, 0],
                    },
                }
            ]
        }
    },
    {
        target: '#actions-in-list',
        content: 'You can now see the actions you’ve added to your list.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#list-resources-gain',
        content: 'Here you can see which resources your list will generate or consume per second.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#list-effects-gain',
        content: 'Here you can see the effects your list will provide per second.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#actions-in-list',
        content: 'Actions in a list run simultaneously. If you add Walking and Beggar, each will run at 50% efficiency. But what if you want to prioritize Walking?',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.amount-for-action_walk',
        content: 'Just set the effort value for Walking to 2 or higher. That tells the system to prioritize Walking while other actions run at a reduced rate.',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.effort-auto-action_beggar',
        content: 'Some actions generate resources that you want to keep non-negative. Setting Auto effort turned on will make list automatically adjust minimum effort required to make resources that are generated by this action positive',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.detail-blade button.save-and-close',
        content: 'Alright, let’s save your list!',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#pick-action-list',
        content: 'Now click the "Pick list" button.',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'left',
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.list-selector',
        content: 'You can now see your list here. Use this pop-up to run, edit, or delete it anytime. That’s everything about action lists!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
];

const stepsMap = [
    {
        target: '.map-wrap',
        content: 'Exploring the map is crucial for progression, as you can discover various herbs and resources — even some that grant permanent bonuses.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-wrap .map-cat',
        content: 'The map is divided into 225 tiles (15 vertical × 15 horizontal). Each tile has its own terrain type, which determines the kind of loot you can find there.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-wrap .map-cat #map-tile-7-7',
        content: 'The central map tile cannot be selected or explored — it represents your settlement. But you can select any other tile.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-wrap .map-cat #map-tile-7-8',
        content: 'Click on one of the adjacent tiles to view its details.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.map-tile-details',
        content: 'Once you’ve selected a tile, its details appear in the right sidebar.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-exploration-loot',
        content: 'Here you can see the potential loot for this tile. Loot drops are revealed once you find them for the first time. Sometimes it’s worth continuing to explore the same tile to discover all possible rewards.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-exploration-upkeep',
        content: 'However, exploration has a cost — "Gather Effort." I’ll explain how to produce it soon. For now, just know: the farther the tile is from the center, the more effort it costs — but the rewards are usually better.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.gather-efforts-indicator',
        content: 'You can track your used and produced Gather Effort here. Without producing it, exploration won’t yield benefits.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#main-menu-actions',
        content: 'Looks like you’re not producing any Gather Effort. Let’s fix that — head to the Actions panel.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.actions-wrap .ingame-box.actions',
        content: 'Find and run an action that generates "Gather Effort".',
        disableBeacon: true,
        disableOverlayClose: true,
        placement: 'right',
        spotlightClicks: true,
        actionRequired: true,
        floaterProps: {
            placement: 'right',
            modifiers: [
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: [],
                    },
                },
                {
                    name: 'preventOverflow',
                    enabled: false
                },
                {
                    name: 'offset',
                    options: {
                        offset: [0, 0],
                    },
                }
            ]
        }
    },
    {
        target: '#main-menu-world',
        content: 'Now go back to the world map.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.gather-efforts-indicator',
        content: 'You can now see that your Gather Effort is above zero — meaning you can begin exploring!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-wrap .map-cat #map-tile-7-8',
        content: 'Select the same tile again.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#run-map-tile',
        content: 'Start gathering from this tile to begin receiving resources.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.gather-efforts-indicator',
        content: 'Notice that your Gather Effort is now being used.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-tile-efficiency',
        content: 'If your Gather Effort is insufficient, your gathering efficiency drops. You can see the efficiency level here.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-lists-panel',
        content: 'Just like with actions, you can also create lists to gather from multiple tiles at once. If you forget how lists work — check out the “Action Lists” tutorial again.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.map-wrap .map-cat',
        content: 'That’s all for gathering! It may take time to improve your efficiency, but it’s a powerful tool for advancing your progress.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
];


const stepsCrafting = [
    {
        target: '.crafting-workshop-wrap',
        content: 'Crafting is another key feature that lets you create new materials and use them to further boost your progression.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat',
        content: 'Here you can see a list of available recipes.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat .card.craftable',
        content: 'Hovering over a specific recipe shows its details. Try hovering over one now.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.recipe-details',
        content: 'Here you can see what the recipe consumes and produces. This one uses crafting slots, crafting effort, and wood — and produces refined wood. All recipes consume Crafting Slots and Crafting Effort.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat .card.craftable',
        content: 'To start crafting, you need two things: 1) produce all required resources; 2) assign a crafting level to the recipe. The higher the level, the more resources it will consume and produce.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.crafting-slots',
        content: 'Crafting slots determine how much crafting you can do at once. One slot is needed per crafting level. So, if you have one slot, you can run one recipe at level 1. Two slots could be used for one recipe at level 2 or two recipes at level 1 each.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.crafting-efforts',
        content: 'Crafting Effort represents the total amount of energy you can spend on crafting.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#main-menu-actions',
        content: 'You have crafting slots — but you still need Crafting Effort and resources. Let’s go to the Actions tab and produce them.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.actions-wrap',
        content: 'Create and run a list that produces Crafting Effort and wood. For example, include "Woodcutting" and "Basic Craft".',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true,
    },
    {
        target: '#main-menu-workshop',
        content: 'Looks like you’re producing wood and Crafting Effort! Now let’s return to the Workshop.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.craftables-cat .card.craftable input.level-set',
        content: 'Now increase the crafting level of the recipe to any value above 0.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.crafting-slots',
        content: 'As you can see, you’re now using more crafting slots.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.crafting-efforts',
        content: 'You’ve also started using your Crafting Effort. If you don’t produce enough, your crafting efficiency will drop.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat .card.craftable',
        content: 'There’s one more thing to note. Let’s hover over the recipe again.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.recipe-details',
        content: 'Increasing the crafting level will exponentially raise both input and output. Higher levels consume more resources but craft faster.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.recipe-details .efficiency-block',
        content: 'Watch this area closely — if your recipe is missing any requirements, its efficiency will drop. Details will be shown here.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.crafting-workshop-wrap',
        content: 'That’s it for crafting! Good luck and happy crafting!',
        disableBeacon: true,
        disableOverlayClose: true,
    }
];


const stepsAlchemy = [
    {
        target: '.alchemy-workshop-wrap',
        content: 'Alchemy lets you brew potions using herbs and other ingredients.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat',
        content: 'Here you can see a list of available potion recipes.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat .card.craftable',
        content: 'Hovering over a recipe shows its details. Try hovering over one now.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.recipe-details',
        content: 'Here you can see what the recipe consumes and produces. For example, it uses alchemy slots, alchemy effort, and some herbs found on the map — and produces a Small Endurance Flask. All recipes consume Alchemy Slots and Alchemy Effort.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat .card.craftable',
        content: 'To begin brewing, start producing the required ingredients, then assign a brewing level to the recipe. The higher the level, the more resources it will consume and produce.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.alchemy-slots',
        content: 'Alchemy slots determine how many potions you can brew at once. One slot is needed per recipe level. For example, with 2 slots, you could brew one recipe at level 2 or two recipes at level 1.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.alchemy-efforts',
        content: 'Alchemy Effort determines the total energy available for potion brewing.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#main-menu-actions',
        content: 'You have alchemy slots, but you still need Alchemy Effort and other ingredients. Let’s go to the Actions tab and produce them.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.actions-wrap',
        content: 'Create and run an action or list that produces Alchemy Effort.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true,
    },
    {
        target: '#main-menu-workshop',
        content: 'Looks like you’re producing Alchemy Effort! Let’s return to the Workshop.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.craftables-cat .card.craftable input.level-set',
        content: 'Now increase the recipe’s brewing level to any value above 0.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.alchemy-slots',
        content: 'As you can see, you’re now using more alchemy slots.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.alchemy-efforts',
        content: 'You’ve also started using your Alchemy Effort. If you don’t produce enough, your brewing efficiency will drop.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.craftables-cat .card.craftable',
        content: 'One more thing to note — let’s hover over the recipe again.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.recipe-details',
        content: 'Increasing a recipe’s brewing level exponentially increases its production and consumption. Higher levels use more resources but allow you to brew potions faster if you have the ingredients.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.recipe-details .efficiency-block',
        content: 'Watch this section — if the recipe is missing any ingredients, it will run at reduced efficiency. The info is shown here.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.alchemy-workshop-wrap',
        content: 'That’s everything you need to know about alchemy. Good luck!',
        disableBeacon: true,
        disableOverlayClose: true,
    }
];


const stepsInventory = [
    {
        target: '.inventory-wrap',
        content: 'The inventory lets you view and manage all the items you currently own — materials, flasks, herbs, and more.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.inventory-items-wrap',
        content: 'Here you’ll find a list of your items and their quantities. You can obtain items in various ways as you progress — some are unlocked through gameplay, others can be bought in the shop.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#shop',
        content: 'Let’s go to the shop.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#shop-items-tab',
        content: 'Switch to the "Items" section of the shop.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.items-cat',
        content: 'Here you can see which items are available for purchase. As you progress, more items will become available.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#shop-item-resource-inventory_brightleaf',
        content: 'Hover over "Brightleaf" to see what it does.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.price-section',
        content: 'This section shows the item’s cost.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.lasting-effects-section',
        content: 'This section lists the effects provided by the item.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#shop-item-resource-inventory_brightleaf',
        content: 'Left-click the item to purchase it. Make sure you have enough coins! If not, earn more and restart the tutorial.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#main-menu-inventory',
        content: 'Now let’s return to the Inventory tab.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.inventory-items-wrap',
        content: 'You should now see "Brightleaf" listed among your items.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#inventory-item-card-inventory_brightleaf',
        content: 'Click your "Brightleaf" item.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.inventory-items-blade',
        content: 'As with most items, hovering over them shows details. Some special items are worth exploring further.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.pin-resource-button',
        content: 'You can pin or unpin resources to the left sidebar for easier access.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.consume-button',
        content: 'Click this button to consume the item. Alternatively, you can right-click the item icon to consume it directly.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.active-effects-wrap',
        content: 'Since Brightleaf has a lasting effect, it now appears here among other buffs and debuffs.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.toggle-effect-monitor',
        content: 'You can toggle visibility here. Turning this off hides the item’s effect in the sidebar — useful for permanent effects you don’t want to be distracted by.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.inventory-wrap',
        content: 'That’s all for the inventory. Good luck — and be careful with toxic mushrooms!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
];


const stepsSpellbook = [
    {
        target: '.spells-list',
        content: 'Spells provide various temporary bonuses at the cost of mana. Different spells are useful in different situations.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#spell_card_spell_magic_insight',
        content: 'Clicking a spell shows its details. Let’s click on "Magic Insight".',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.tags-container',
        content: 'Here you can see this spell’s tags. Most bonuses that affect spells do so based on their tags, so it’s important to check them when choosing upgrades.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-effects-on-usage-block',
        content: 'This block shows the effects applied immediately after casting the spell. As you can see, it consumes mana but gives knowledge.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-cooldown-block',
        content: 'Some spells have cooldowns, meaning you can only cast them once within a certain period of time.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#cast-spell-btn',
        content: 'Let’s cast this spell.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#spell_card_spell_focus',
        content: 'Now, let’s select the "Focus" spell.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.spell-effects-on-usage-block',
        content: 'This spell also consumes mana when cast.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-effects-lasting-block',
        content: 'Unlike Magic Insight, this one provides modifiers for a limited duration. Here you can see its duration and effects.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#cast-spell-btn',
        content: 'Let’s cast Focus. Keep in mind—you can’t cast a spell if it’s already active.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.active-effects-wrap',
        content: 'Lasting spell effects appear here. You can customize which effects are shown.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.toggle-effect-monitor',
        content: 'Turning this off hides the effect in the sidebar. This is useful for permanent effects you don’t want to be distracted by.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spells-list',
        content: 'That’s all about spells!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
];


const stepsSpellLevels = [
    {
        target: '.spell-xp-container',
        content: 'Congrats on unlocking spell leveling! It’s an important aspect of making your magic even more powerful.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-xp-container .xp-box',
        content: 'When you cast spells, they gain XP.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-xp-container .progress-bar',
        content: 'Once this progress bar fills up, the maximum level of the spell increases.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-xp-container .set-level',
        content: 'Increasing a spell’s level raises both its cost and its power. However, costs scale faster than bonuses, so it’s worth leveling up only when you have enough mana.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.spell-wrap',
        content: 'Select any spell that has a maximum level of 2 or higher. Or just cast Magic Insight a few times to level it up—it’s the easiest one to train.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.spell-xp-container .set-level .setter',
        content: 'Now change the spell level.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.spell-effects-on-usage-block',
        content: 'As you can see, both the spell’s cost and output have changed. The most efficient way to manage your spell level is to set the highest value that still keeps your mana positive.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#save-spell-button',
        content: 'Click "Save" to apply the changes.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.spells-list',
        content: 'Now that you understand spell levels, you can use your magic even more efficiently. That’s it!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
];


const stepsListsAutomation = [
    {
        target: '.autotrigger-settings.block',
        content: 'List automation is a background process that runs periodically and switches to the highest-priority list that meets the specified trigger condition.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.automation-enabled',
        content: 'You can toggle list automation here. Enabling it will immediately start the automation job and switch to the highest-priority list that meets the auto-trigger condition.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.automation-interval',
        content: 'Sometimes, you may not want automation to run too frequently. You can configure the interval here.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.autotrigger-settings',
        content: 'Now let’s return to the specific list automation config. The run condition is based on rules combined into a logical expression.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '#add-rule-button',
        content: 'Click the "Add rule" button.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.rules',
        content: 'Now you can define a rule. For example: Attribute Strength < 150, or Resource Amount Coins > 90%.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.autotrigger-settings.block',
        content: 'Set up any 2 rules. Don’t worry if you make a mistake — you can edit them at any time. For now, the goal is to learn how automation works.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.pattern-wrap',
        content: 'Here you can combine your rules into a logical expression that returns True or False to determine if your list should run. For example, "1 AND 2" means both rules must match, while "1 OR 2" means either rule is enough. You can also use complex expressions like "(1 AND 2) OR (3 AND NOT 4)".',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.pattern-wrap',
        content: 'Set the condition expression here. Try using "1 OR 2" or "1 AND 2".',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '.autotrigger-on-off',
        content: 'If this toggle is off, the list won’t be included in the automation cycle. So, when you’re done configuring your automation, don’t forget to turn it on.',
        disableBeacon: true,
        disableOverlayClose: true,
    },
    {
        target: '.save-and-close',
        content: 'Now save your changes. If you don’t, your automation configuration will be lost.',
        disableBeacon: true,
        disableOverlayClose: true,
        spotlightClicks: true,
        actionRequired: true
    },
    {
        target: '#actions-list-wrap',
        content: 'List automation helps you progress without constantly micromanaging the game. That’s all for now!',
        disableBeacon: true,
        disableOverlayClose: true,
    },
];



export const tutorials = {
    initial: stepsInitial,
    actions: stepsActions,
    'action-lists': stepsActionsLists,
    map: stepsMap,
    crafting: stepsCrafting,
    alchemy: stepsAlchemy,
    inventory: stepsInventory,
    spellbook: stepsSpellbook,
    spellLevels: stepsSpellLevels,
    'lists-automation': stepsListsAutomation,
}