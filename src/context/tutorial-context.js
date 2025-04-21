import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import Joyride from 'react-joyride';
import WorkerContext from "./worker-context";
import {useWorkerClient} from "../general/client";

const TutorialContext = createContext(null);

function MyTooltip({ step, closeProps, primaryProps, isNextAllowed, isLastStep, cantBeRetried }) {

    const handleSkip = (e) => {
        // console.log('Skip button clicked');

        if (closeProps.onClick) {
            if(!cantBeRetried) {
                closeProps.onClick(e);
                return;
            }
            if(confirm('Are you sure you want to skip tutorial? If you do so, you won\'t be able to restart it.')) {
                closeProps.onClick(e);
            }
        }
    };

    return (
        <div className={'hint-popup tutorial-popup'}>
            <div className={'step-content'}>{step.content}</div>
            <div className={'buttons'}>
                <div className={'left'}>
                    {isNextAllowed ? (<button {...primaryProps}>{isLastStep ? 'Complete' : 'Next'}</button>) : null}
                </div>
                {!isLastStep ? (<div>
                    <button onClick={handleSkip}>Skip</button>
                </div>) : null}

            </div>
            {/* Кнопки Next/Back/Close */}

        </div>
    );
}

export function TutorialProvider({ children }) {
    // Стан управління Joyride
    const [currentTourId, setCurrentTourId] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [run, setRun] = useState(false);
    const [isNextAllowed, setIsNextAllowed] = useState(true);

    const worker = useContext(WorkerContext);

    const { onMessage, sendData } = useWorkerClient(worker);

    useEffect(() => {
        const step = tutorials[currentTourId]?.[stepIndex];
        if (step) {
            setIsNextAllowed(!step.actionRequired); // дозвіл, якщо не потрібна дія
        }
    }, [stepIndex, currentTourId]);

    // Описуємо всі кроки “туру”
    const stepsInitial = [
        {
            target: '#tutorial-resources',
            content: 'Here you can see your resources. Resources are used in many activities',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
        },
        {
            target: '#tutorial-attr-tab',
            content: 'Click here to see your attributes',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#tutorial-attributes',
            content: 'Attributes are your primary character stats. Hover over specific attribute to see what it does',
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
            content: 'Lets switch back to resources tab',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#actions-list-wrap',
            content: 'Here you can see list of actions available for you. To progress (earn resources, improve attributes) you need to perform various actions',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_walk',
            content: 'Hovering over specific action will show you its details in the right panel. If you click on the action card - you will be able to pin its details to right sidebar.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#item_action_bonuses',
            content: 'Here is the list of action effects that you will receive for running the action. As you can see, Walking will consume energy',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_levelup',
            content: 'Here are passive permanent bonuses that action will provide for level-up. So, Walking will consume energy, but leveling it will increase Stamina (that increases passive energy generation). To upgrade action level you have to run it',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#activate_action_walk',
            content: 'Click "Start" button to start walking, and increase your Stamina',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#level_up_indicator_action_walk',
            content: 'Now, once action is running - it increasing XP. When your progress indicator fills up - your action will level up. Each next level will require more XP.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#tutorial-resources',
            content: 'So, you can see that your energy rate is reduced, but do not worry. Your energy is consumed by running action, but as you get higher Stamina attribute your net energy income will increase',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#tutorial-resources',
            content: 'If some of your resources fall below zero - actions and other stuff using them starts running at reduced efficiency.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_walk',
            content: 'Lets wait for your walk action to level up',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#activate_action_visit_city',
            content: 'Some actions are required to unlock new content. Run visit city till level 2 to unlock new actions and stuff',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#level',
            content: 'During running actions your mage will also receive experience. Each new mage level gives you one skill point. Unspent skill points will be displayed here. Clicking this indicator allows you to allocate your skill point.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#shop',
            content: 'Now, you can run some actions that will help you to earn coins. Dont forget to visit shop once you earn 2 coins',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#goals',
            content: 'If you are not sure what to do - visit your next unlocks. It will give you better understanding of what to do to unlock new content',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#statistics',
            content: 'And you can click here to see various neat stats about your game. Thats all for now, good luck!',
            disableOverlayClose: true, // не даємо закрити кліком поза
            spotlightClicks: true
        }
    ];

    const stepsActions = [
        {
            target: '.actions-menu',
            content: 'OK, lets dive deeper into actions. As it was already mentioned, actions are the key to game progress. For your convenience we have split them into categories',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
        },
        {
            target: '#actions-menu-all',
            content: 'We will return back to navigation very soon, for now lets select "All" actions',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
            actionRequired: true,
            spotlightClicks: true,
        },
        {
            target: '.card.action.training',
            content: 'You can see very basic information about your actions, like name, level and XP requirement in list view. Clicking on the action card will open more action details. Lets do it and go deeper through action details now.',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
            actionRequired: true,
            spotlightClicks: true,
        },
        {
            target: '#action-tags',
            content: 'Every action has tags. There are a lot of bonuses in game, that apply to actions by tags. F.e, "physical training learning speed", "mental activity learning speed" and so on',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#action-rank-data',
            content: 'Most of actions can receive ranks every 100 levels, providing 5% multiplicative boost (Rank boost = 1.05 ^ rank)',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_bonuses',
            content: 'Here is the list of action effects that you will receive for running the action. As you can see, Walking will consume energy',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#item_action_levelup',
            content: 'Here are passive permanent bonuses that action will provide for level-up. So, Walking will consume energy, but leveling it will increase Stamina (that increases passive energy generation). To upgrade action level you have to run it',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#actions-list-wrap',
            content: 'Click "Start" button to start any action',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.card.action.active',
            content: 'Now, once action is running - it increasing XP. When your progress indicator fills up - your action will level up. Each next level will require more XP.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
        },
        {
            target: '#tutorial-resources',
            content: 'So, you can see that your resource balances are changed. Most of actions require some specific resources to operate.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#tutorial-resources',
            content: 'If some of your resources fall below zero - actions and other stuff using them starts running at reduced efficiency.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.actions-menu',
            content: 'Now, that we have learned how to check what action is useful for what, lets return to navigation',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
        },
        {
            target: '.actions-menu .add-custom-filter',
            content: 'Eventually your actions list will grow up significantly. But, do not worry - you have ability to configure actions tabs for your needs. Click "Edit Filters"',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#custom-filters-list',
            content: 'Here you can see and manage your filters',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
        },
        {
            target: '#add-custom-filter',
            content: 'Lets try to add new custom filter',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: 'input.filter-name-input',
            content: 'Set a name for your filter. This is how filter will be displayed in filters list and top filters navigation panel. Dont worry, youll be able to change it any time',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true,
        },
        {
            target: '.filter-rules .add-rule',
            content: 'Now you have to setup filtering conditions that will be used to determine what actions will appear in your list. Lets click to add rule',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.filter-rules .custom-filter-rule:nth-of-type(1)',
            content: 'Lets assume we need a separate filter tab that would list only actions providing bonus to Stamina attribute. So, its easy to do! Just set first input "Gives attribute", and select "Stamina" in second dropdown',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.filter-rules .add-rule',
            content: 'But lets assume you want to place in your custom filter tab also actions providing charisma. So, lets go! Add another rule.',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.filter-rules .custom-filter-rule:nth-of-type(2)',
            content: 'As you did it for first rule, set first input "Gives attribute", but select "Charisma" in second dropdown',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.custom-filter-condition',
            content: 'Last, but not least thing - now that we have set up rules, we need to provide logic that should be used to match our rules. Put "1 OR 2" here to let our filter know how to use rules. It will make all actions matching any of our rules to appear under tab. Just in case - you can use arbitrary amount of rules and more complex conditions (F.e - "(1 OR 2) AND (3 OR 4)"). But, for now - lets keep it simple: Put "1 OR 2"',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: 'button.save-custom-filter',
            content: 'Now you have to save your list',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#custom-filters-list',
            content: 'So, now you see your list here. But, to make it visible in top filters panel make sure the checkbox right to the filter name is checked',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'bottom',
        },
        {
            target: '#close-custom-filters-list',
            content: 'You can close custom filters',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#actions-list-wrap',
            content: 'That\'s pretty much everything you should learn about actions. You know how to check their details, run them and how to configure them for your needs. If you missed something - you always can go over this tutorial again. Good luck!',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
        },
    ]

    const stepsActionsLists = [
        {
            target: '#actions-list-wrap',
            content: 'Switching every individual action might be tedious, especially if you need to walk away for some time and you need to focus on several things. But no worries, you can combine your actions into lists. Let me show how to do it!',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#create-action-list',
            content: 'Lets create one!',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.action-list-name-input',
            content: 'Set any name to your list (It can be changed any time in future)',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#actions-in-list',
            content: 'Obviously, at the moment your list is empty. But, you can drag & drop or just click action cards to add ones to the list',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.actions-wrap .ingame-box.actions',
            content: 'Find and click "Walking" and "Beggar" actions to add them to list',
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
                            fallbackPlacements: [], // все ще не дозволяємо фліп
                        },
                    },
                    {
                        name: 'preventOverflow',
                        enabled: false // ← Вимикаємо!
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0], // можеш дати [0, 10] якщо хочеш відступ
                        },
                    }
                ]
            }
        },
        {
            target: '#actions-in-list',
            content: 'Now you can see here actions you\'ve added to your list.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#list-resources-gain',
            content: 'Here you can see list resources that your list will give/drain per second',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#list-effects-gain',
            content: 'Here you can see list effects that your list will give per second',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#actions-in-list',
            content: 'The actions added to list will be running simultaneously. If you have Walking and Beggar in your list, they will run at 50% efficiency each. But what if you want to focus on Walking more?',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        // here
        {
            target: '.amount-for-action_walk',
            content: 'Just set effort for Walking to 2 or higher. That will mean that list will be more focused on Walking, while other actions will run at reduced rate',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.list-editor button.save-and-close',
            content: 'Alright, lets save our list!',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#pick-action-list',
            content: 'Now click "Pick list" button',
            disableBeacon: true,
            disableOverlayClose: true,
            placement: 'left',
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.list-selector',
            content: 'Now you can see your list here. You can run/edit/delete your list any time using this pop-up. That\'s all about action lists now.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
    ]

    const stepsMap = [
        {
            target: '.map-wrap',
            content: 'Map exploration is very important for game progression, since you can find here a lot of herbs and resources, even ones providing permanent bonuses.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-wrap .map-cat',
            content: 'Map is divided onto 225 tiles (15 vertical X 15 horizontal). Every tile has its terrain type, which determines what kind of loot you can find there.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-wrap .map-cat #map-tile-7-7',
            content: 'The central map tile cant be selected or researched, since its your settlement. But you can select any different map tile.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-wrap .map-cat #map-tile-7-8',
            content: 'Lets click to one of adjacent tiles to see it details',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.map-tile-details',
            content: 'Once you selected specific map tile, you can see it details in the right sidebar.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-exploration-loot',
            content: 'Here you can see potential loot on this tile. Possible drops are revealed after you successfully found them in the map tile for the first time. So, it makes sense sometimes to keep tile exploration until you revealed all its possible loot',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-exploration-upkeep',
            content: 'However, map tile exploration has upkeep - "Gather Effort". I will explain if few moments how to get it, but for now - just remember: the further map tile is from the map center - the more Gather Effort it costs, but the more Gather Effort it costs - the better loot chances and amounts you can get',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.gather-efforts-indicator',
            content: 'You can see your used/produced gather effort here. Without producing it map exploration wont provide any benefits.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#main-menu-actions',
            content: 'It looks like you are not producing any Gathering Effort. Lets fix it - navigate to Actions panel',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.actions-wrap .ingame-box.actions',
            content: "Find and run any action that provide you 'Gather Effort'",
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
                            fallbackPlacements: [], // все ще не дозволяємо фліп
                        },
                    },
                    {
                        name: 'preventOverflow',
                        enabled: false // ← Вимикаємо!
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0], // можеш дати [0, 10] якщо хочеш відступ
                        },
                    }
                ]
            }
        },
        {
            target: '#main-menu-world',
            content: 'Now navigate back to world map',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.gather-efforts-indicator',
            content: 'Now you can see you gathering effort is something above zero, which means you can start map exploration.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-wrap .map-cat #map-tile-7-8',
            content: 'Select map tile again',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#run-map-tile',
            content: 'Start gathering your map tile to begin receiving some neat resources',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.gather-efforts-indicator',
            content: 'Note that your gathering effort is now in use.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-tile-efficiency',
            content: 'If your gathering effort is not sufficient, your gather efficiency will be dropped. Here you can see how efficient your gathering for selected tile is',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-lists-panel',
            content: 'And, as in actions, you can also create lists to gather from multiple tiles simultaneously. If you dont remember how it works - just visit "Actions Lists" tutorial, its pretty similar.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.map-wrap .map-cat',
            content: 'Thats all about gathering. It can take time to improve your gathering stats and make it efficient, but its very important and powerful tool to boost your game progress!',
            disableBeacon: true,
            disableOverlayClose: true,
        },
    ]

    const stepsCrafting = [
        {
            target: '.crafting-workshop-wrap',
            content: 'Crafting is another important layer, allowing you to create new materials and using them to further boost your progression',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat',
            content: 'Here you can see list of available recipes',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat .card.craftable',
            content: 'Hovering over specific recipe will show you its details. Hover over one of them',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.recipe-details',
            content: 'Here you can see what this recipe will use and produce. As you can see, it requires crafting slots, crafting effort and wood, but produce refined wood. Different recipes use/produce different things, but all of them will use Crafting Slots and Crafting Effort',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat .card.craftable',
            content: 'To start using crafting recipe we will need two things: 1 - start producing all resources, required for recipe; 2 - assign crafting level to specific recipe. The bigger level you assign - the more resources will be used & produced by it',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.crafting-slots',
            content: 'Crafting slots determines amount of crafting you can do simultaneously. To add a level to crafting effort you will need 1 more slot. So, crafting slots determine the sum of all levels you can put to all crafting recipes simultaneously. If you have one maximum slot - you will be able to run only one recipe at level 1. If you have, let say, 2 maximum slots - you can set them both to one recipe, or run 2 crafting recipes concurrently.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.crafting-efforts',
            content: 'Crafting efforts determine total amount of effort you can put in crafting.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#main-menu-actions',
            content: 'So, you have crafting slots. But, you still need crafting effort and other resources. Lets navigate to Actions tab and set their production',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.actions-wrap',
            content: 'Create and run a list producing crafting effort and wood. F.e, it could be list containing "Woodcutting" and "Basic Craft"',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true,
        },
        {
            target: '#main-menu-workshop',
            content: 'Looks like you producing wood and crafting effort! Now lets return to Workshop',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.craftables-cat .card.craftable input.level-set',
            content: 'Now change recipe crafting level to any value above 0',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.crafting-slots',
            content: 'As you can see, now you using more crafting slots',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.crafting-efforts',
            content: 'You also started using your crafting efforts. If you will produce not enough crafting effort - your crafting efficiency will drop.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat .card.craftable',
            content: 'There is one more important thing that you should pay attention. Lets hover over our recipe again',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.recipe-details',
            content: 'Rising level of recipe crafting will increase it production and consumptions exponentially. In general assigning bigger level will make you waste more resources, but you will craft materials faster.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.recipe-details .efficiency-block',
            content: 'Pay attention to this information - if you are missing some requirements for your recipe, it will run less efficient. This info will be displayed here.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.crafting-workshop-wrap',
            content: 'Thats it for now! Have a nice crafting!',
            disableBeacon: true,
            disableOverlayClose: true,
        }
    ]


    const stepsAlchemy = [
        {
            target: '.alchemy-workshop-wrap',
            content: 'Alchemy allows you to create potions from herbs and other ingredients',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat',
            content: 'Here you can see list of available recipes for potions',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat .card.craftable',
            content: 'Hovering over specific recipe will show you its details. Hover over one of them',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.recipe-details',
            content: 'Here you can see what this recipe will use and produce. As you can see, it requires alchemy slots, alchemy effort and some herbs that you can find in map, but produce Small Endurance Flask. Different potion recipes use/produce different things, but all of them will use Alchemy Slots and Alchemy Effort',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat .card.craftable',
            content: 'To start using alchemy recipe we will need start producing all resources, required for recipe, and than assign brewing level to specific recipe. The bigger level you assign - the more resources will be used & produced by it',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.alchemy-slots',
            content: 'Alchemy slots determines amount of potion brewing you can do simultaneously. To add a level to alchemy recipe you will need 1 more slot. So, alchemy slots determine the sum of all levels you can put to all potion recipes simultaneously. If you have one maximum slot - you will be able to run only one recipe at level 1. If you have, let say, 2 maximum slots - you can set them both to one recipe, or run 2 potion recipes concurrently.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.alchemy-efforts',
            content: 'Alchemy efforts determine total amount of effort you can put in alchemy.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#main-menu-actions',
            content: 'So, you have alchemy slots. But, you still need alchemy effort and other resources. Lets navigate to Actions tab and set their production',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.actions-wrap',
            content: 'Create and run a list or action producing alchemy effort',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true,
        },
        {
            target: '#main-menu-workshop',
            content: 'Looks like you producing alchemy effort! Now lets return to Workshop',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.craftables-cat .card.craftable input.level-set',
            content: 'Now change recipe brewing level to any value above 0',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.alchemy-slots',
            content: 'As you can see, now you using more alchemy slots',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.alchemy-efforts',
            content: 'You also started using your alchemy efforts. If you will produce not enough alchemy effort - your alchemy efficiency will drop.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.craftables-cat .card.craftable',
            content: 'There is one more important thing that you should pay attention. Lets hover over our recipe again',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.recipe-details',
            content: 'Rising level of recipe brewing will increase it production and consumptions exponentially. In general assigning bigger level will make you waste more resources, but you will brew potions faster if you have enough ingredients.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.recipe-details .efficiency-block',
            content: 'Pay attention to this information - if you are missing some requirements for your recipe, it will run less efficient. This info will be displayed here.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.alchemy-workshop-wrap',
            content: 'Thats all about alchemy. Good luck!',
            disableBeacon: true,
            disableOverlayClose: true,
        }
    ]

    const stepsInventory = [
        {
            target: '.inventory-wrap',
            content: 'In inventory you can see and manage list of items that you currently have. It can be materials, flasks, herbs and other stuff',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.inventory-items-wrap',
            content: 'Here you can see list and quantities of items you own. There are different ways to get different items, that will be unlocked as you progress. But some of them can be simply purchased in the shop',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#shop',
            content: 'Lets navigate to the shop',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#shop-items-tab',
            content: 'Switch to "Items" section in the shop',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.items-cat',
            content: 'You can see here items that you can purchase. As you progress you will unlock new items',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#shop-item-resource-inventory_brightleaf',
            content: 'Lets hover over Brightleaf to see what is it',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.price-section',
            content: 'Here you can see the cost of the item',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.lasting-effects-section',
            content: 'Here you can see effects provided by item',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#shop-item-resource-inventory_brightleaf',
            content: 'Left clicking on item will purchase it. Make sure you have enough coins to buy it, and purchase one. If you dont - just earn coins, and restart the tutorial.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#main-menu-inventory',
            content: 'Lets go back to inventory tab now',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.inventory-items-wrap',
            content: 'Now you can see your purchased Brightleaf in list of items you own',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#inventory-item-card-inventory_brightleaf',
            content: 'Click your "Brightleaf"',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.inventory-items-blade',
            content: 'As for most items in game, hovering over item shows it details. However, there are few items that are worth to discuss them separately.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.pin-resource-button',
            content: 'You can pin or unpin your resources to left sidebar to be able to access them easier',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.consume-button',
            content: 'Click on the button to consume it. By the way, you can also consume items without opening their details by right-clicking item icon',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.active-effects-wrap',
            content: 'Since consumed Brightleaf has lasting effects, it will be shown along with other buffs/debuffs here',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.toggle-effect-monitor',
            content: 'However, this can be turned off here. If you put it off - item effect wont appear in left sidebar. It might be useful if you running item permanently and dont want it to distract you.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.inventory-wrap',
            content: 'Thats all about inventory. Good luck and be careful with toxic mushrooms ;)',
            disableBeacon: true,
            disableOverlayClose: true,
        },
    ]

    const stepsSpellbook = [
        {
            target: '.spells-list',
            content: 'Spells can be used to receive various temporary bonuses at cost of mana. Different spells can be useful in different situations.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#spell_card_spell_magic_insight',
            content: 'Clicking on specific spell will show you its details. Lets click on "Magic Insight"',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.tags-container',
            content: 'Here you can see tags of this spell. Most of bonuses that applied to spells are applied by their tags, so its important to check tags before doing important decisions regarding corresponding upgrades prioritization',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-effects-on-usage-block',
            content: 'In this block you can see effects this spell gives immediately after you cast it. As you can see, it using mana but gives knowledge',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-cooldown-block',
            content: 'Some spells have cooldowns, meaning that you can cast them once in some brief period of time',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#cast-spell-btn',
            content: 'Lets cast this spell',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '#spell_card_spell_focus',
            content: 'Now, lets select "Focus" spell',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.spell-effects-on-usage-block',
            content: 'This spell also takes mana to cast',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-effects-lasting-block',
            content: 'But, unlikely to Magic Insight, this one providing some modifiers during some limited time, while its active. Here you can see spell duration and its effects',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#cast-spell-btn',
            content: 'Lets cast Focus. Keep in mind - you cant cast spell if its already running',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.active-effects-wrap',
            content: 'Lasting effects from spells can be also seen here. However, you can configure this as well',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.toggle-effect-monitor',
            content: 'If you put it off - item effect wont appear in left sidebar. It might be useful if you running item permanently and dont want it to distract you.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spells-list',
            content: 'Thats all about spells.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
    ]

    const stepsSpellLevels = [
        {
            target: '.spell-xp-container',
            content: 'Congrats on unlocking spells leveling! Its important aspect of making your magic even more powerful',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-xp-container .xp-box',
            content: 'When you cast spells they receive XP.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-xp-container .progress-bar',
            content: 'When this progress bar fills, spell maximum level is increased.',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-xp-container .set-level',
            content: 'When increasing spell level its cost and power are increased. But, costs are scaling faster than bonuses. So, it worth rising level only in case you have enough mana',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '.spell-wrap',
            content: 'Select any spell that has maximum level 2 or greater (Or run Magic Insight several times to level up it, it would be the easiest spell to level)',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.spell-xp-container .set-level .setter',
            content: 'Change spell level.',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.spell-effects-on-usage-block',
            content: 'As you can see, the spell costs and outputs were changed. Dont forget that most efficient way to manage your spell level is to set the highest possible that will keep your mana positive',
            disableBeacon: true,
            disableOverlayClose: true,
        },
        {
            target: '#save-spell-button',
            content: 'Hit "Save" to make your level changes applied',
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            actionRequired: true
        },
        {
            target: '.spells-list',
            content: 'Now that you know about spell levels, you can use your magic even more efficiently. That\'s it!',
            disableBeacon: true,
            disableOverlayClose: true,
        },
    ]


    const tutorials = {
        initial: stepsInitial,
        actions: stepsActions,
        'action-lists': stepsActionsLists,
        map: stepsMap,
        crafting: stepsCrafting,
        alchemy: stepsAlchemy,
        inventory: stepsInventory,
        spellbook: stepsSpellbook,
        spellLevels: stepsSpellLevels
    }

    // Допоміжні функції
    const startTutorialById = useCallback((id) => {
        if (!tutorials[id]) {
            console.warn(`Tutorial with ID "${id}" not found.`);
            return;
        }

        if (run) {
            console.warn('A tutorial is already running.');
            return;
        }

        setCurrentTourId(id);
        setStepIndex(0);
        setRun(true);
    }, [run]);

    const stopTutorial = useCallback(() => {
        setRun(false);
        setCurrentTourId(null);
    }, []);

    const nextStep = useCallback(() => {
        setStepIndex((prev) => prev + 1);
    }, []);

    const jumpOver = useCallback((idx, param = 2) => {
        setStepIndex((prev) => idx ?? prev + param);
    }, []);

    const unlockNextById = useCallback((check_index) => {
        setStepIndex((prev) => prev === check_index ? prev + 1 : prev);
    })

    const setNextAllowedById = useCallback((check_index) => {
        console.log('Allowing: ', check_index, stepIndex);
        if (check_index === stepIndex) {
            setIsNextAllowed(true);
        }
    }, [stepIndex]);

    // Можемо передбачити й інші методи (goToStep, prevStep, тощо)

    // Будуємо контекстне значення
    const value = {
        stepIndex,
        setStepIndex,
        run,
        setRun,
        startTutorialById,
        stopTutorial,
        nextStep,
        unlockNextById,
        jumpOver,
        currentTourId,
        setNextAllowedById,
        isNextAllowed
    };

    return (
        <TutorialContext.Provider value={value}>
            {/* Joyride - один раз у “верхньому” рівні */}
            <Joyride
                steps={tutorials[currentTourId] || []}
                tooltipComponent={(props) => {
                    const isLastStep = (tutorials[currentTourId]?.length ?? 0) - 1 === stepIndex;
                    return <MyTooltip {...props} isNextAllowed={isNextAllowed} isLastStep={isLastStep} cantBeRetried={currentTourId === 'initial'}/>;
                }}
                stepIndex={stepIndex}
                run={run}
                continuous
                showSkipButton
                disableBeacon={true}
                callback={(data) => {
                    const { index, type, action, status } = data;

                    // console.log('UNN: ', data);

                    if (type === 'tour:end') {
                        if (status === 'skipped') {
                            // Користувач пропустив тур
                            sendData('set_tour_finished', { skipStep: stepIndex, tutorial: currentTourId });
                        } else if (status === 'finished') {
                            // Тур завершено нормально
                            sendData('set_tour_finished', { tutorial: currentTourId });
                        }
                        setRun(false);
                    }

                    if (type === 'step:after' && action === 'next') {
                        if(index >= tutorials[currentTourId].length - 1) {
                            // console.log('Finishhh!');
                            sendData('set_tour_finished', { tutorial: currentTourId });
                        }
                        setStepIndex(index + 1);
                    }
                    if (type === 'step:after' && action === 'close') {
                        sendData('set_tour_finished', { skipStep: stepIndex, tutorial: currentTourId });
                        setRun(false);
                    }


                }}
                styles={{
                    options: {
                        arrowColor: '#fff',
                        // Фоновий колір тултипу
                        backgroundColor: '#111',
                        // Колір затемнення фону (оверлею)
                        overlayColor: 'rgba(0, 0, 0, 0.5)',
                        // Основний колір (колір кнопок Next, Back, Skip)
                        primaryColor: '#112',
                        // Колір тексту (у тултипі)
                        textColor: '#fff',
                        zIndex: 10000
                    },
                    tooltip: {
                        // Стиль основного контейнера тултипу
                        borderRadius: '2px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#777'
                    },
                    spotlight: {
                        pointerEvents: 'none'
                    }
                }}
            />
            {children}
        </TutorialContext.Provider>
    );
}


export function useTutorial() {
    return useContext(TutorialContext);
}
