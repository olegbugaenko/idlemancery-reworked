import {GameModule} from "./shared/game-module";
import {gameCore, GameCore, gameEffects, gameEntity, gameResources} from 'game-framework';
import {MageModule} from "./modules/mage/mage.module";
import {ResourcePoolModule} from "./modules/resources/resource-pool.module";
import {ActionsModule} from "./modules/actions/actions.module";
import {AttributesModule} from "./modules/attributes/attributes.module";
import {ShopModule} from "./modules/items/shop.module";
import {InventoryModule} from "./modules/inventory/inventory.module";
import {PropertyModule} from "./modules/property/property.module";
import {SpellModule} from "./modules/magic/spells.module";
import {CraftingModule} from "./modules/workshop/crafting.module";
import {PlantationsModule} from "./modules/workshop/plantations.module";
import {GuildsModule} from "./modules/social/guilds.module";
import {UnlockNotificationsModule} from "./shared/modules/unlock-notifications.module";
import {RandomEventsModule} from "./modules/general/random-events.module";
import {TemporaryEffectsModule} from "./modules/general/temporary-effects.module";


export class MainModule extends GameModule {

    constructor() {
        super();
        gameCore.registerModule('attributes', AttributesModule);
        gameCore.registerModule('mage', MageModule);
        gameCore.registerModule('resource-pool', ResourcePoolModule);
        gameCore.registerModule('actions', ActionsModule);
        gameCore.registerModule('property', PropertyModule);
        gameCore.registerModule('shop', ShopModule);
        gameCore.registerModule('inventory', InventoryModule);
        gameCore.registerModule('magic', SpellModule);
        gameCore.registerModule('crafting', CraftingModule);
        gameCore.registerModule('plantations', PlantationsModule);
        gameCore.registerModule('guilds', GuildsModule);
        gameCore.registerModule('unlock-notifications', UnlockNotificationsModule);
        gameCore.registerModule('random-events', RandomEventsModule);
        gameCore.registerModule('temporary-effects', TemporaryEffectsModule);



        this.eventHandler.registerHandler('initialize-game', (data) => {
            console.log('gameCoreBeforeInited', GameCore.instance);
            gameCore.initialize();
            console.log('gameCoreInited', GameCore.instance);
            this.eventHandler.sendData('initialized', {...data, received: true});
            console.log('sent initialized')
        })

        this.eventHandler.registerHandler('load-game', (data) => {
            console.log('load-game received');
            gameCore.load(data);
            console.log('loaded');
            this.eventHandler.sendData('loaded', {...data, received: true});
        })

        this.eventHandler.registerHandler('reset-game', () => {
            console.log('reset-game received');
            gameCore.stopTicking();
            gameCore.load({});
            console.log('reseted');
            const cheat = 1;
            gameCore.startTicking(100, () => 0.1*cheat*(gameCore.getModule('mage').bankedTime?.speedUpFactor ?? 1), () => {
                if(gameCore.numTicks % 100 === 0) {
                    this.save();
                }
            }, false)
            this.eventHandler.sendData('loaded', { received: true, isReset: true });
        })

        this.eventHandler.registerHandler('start-ticking', () => {
            const cheat = 1;
            // const speedUpMode = gameCore.getModule('mage').bankedTime?.speedUpFactor ?? 1;
            // console.log('gameCore', GameCore.instance, speedUpMode);
            gameCore.startTicking(100, () => 0.1*cheat*(gameCore.getModule('mage').bankedTime?.speedUpFactor ?? 1), () => {
                if(gameCore.numTicks % 100 === 0) {
                    this.save();
                }
            }, false)
        })

        this.eventHandler.registerHandler('query-unlocks', (payload) => {
            const unlocks = {
                'actions': true,
                'actionLists': gameEntity.getLevel('shop_item_notebook') > 0,
                'shop': gameCore.getModule('shop').isUnlocked,
                'inventory': gameEntity.getLevel('shop_item_backpack') > 0,
                'property': gameEntity.getLevel('shop_item_tent') > 0,
                'spellbook': gameEntity.getLevel('shop_item_spellbook') > 0,
                'crafting': gameEntity.getLevel('shop_item_crafting_courses') > 0,
                'alchemy': gameEntity.getLevel('shop_item_alchemy_courses') > 0,
                'workshop': gameEntity.getLevel('shop_item_crafting_courses') > 0 || gameEntity.getLevel('shop_item_alchemy_courses') > 0 || gameResources.getResource('plantation_slots').income > 0,
                'plantation': gameResources.getResource('plantation_slots').income > 0,
                'guilds': gameEffects.getEffectValue('attribute_charisma') >= 500,
                'social': gameEffects.getEffectValue('attribute_charisma') >= 500,
            }
            let label = 'unlocks';
            if(payload?.prefix) {
                label = `${label}-${payload?.prefix}`;
            }
            this.eventHandler.sendData(label, unlocks);
        })

        this.eventHandler.registerHandler('get-save-string', ({ type }) => {
            const saveObj = gameCore.save();
            this.eventHandler.sendData('saved-string', { string: JSON.stringify(saveObj), type });
        })

        MainModule.instance = this;
    }

    initialize() {

    }

    tick() {


    }

    save() {
        const saveStr = gameCore.save();
        this.eventHandler.sendData('save-game', saveStr);
    }

    load() {

    }

}

export const mainModule = () => MainModule.instance || new MainModule();