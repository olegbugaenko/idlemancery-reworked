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
import {MapModule} from "./modules/map/map.module";
import {HotkeysModule} from "./shared/modules/hotkeys.module";
import {MonitoringModule} from "./shared/modules/monitoring.module";
import {RulesModule} from "./shared/modules/rules.module";
import {CoursesModule} from "./modules/items/courses.module";


export class MainModule extends GameModule {

    constructor() {
        super();
        gameCore.registerModule('attributes', AttributesModule);
        gameCore.registerModule('temporary-effects', TemporaryEffectsModule);
        gameCore.registerModule('resource-pool', ResourcePoolModule);
        gameCore.registerModule('mage', MageModule);
        gameCore.registerModule('actions', ActionsModule);
        gameCore.registerModule('property', PropertyModule);
        gameCore.registerModule('shop', ShopModule);
        gameCore.registerModule('courses', CoursesModule);
        gameCore.registerModule('inventory', InventoryModule);
        gameCore.registerModule('magic', SpellModule);
        gameCore.registerModule('crafting', CraftingModule);
        gameCore.registerModule('plantations', PlantationsModule);
        gameCore.registerModule('guilds', GuildsModule);
        gameCore.registerModule('unlock-notifications', UnlockNotificationsModule);
        gameCore.registerModule('random-events', RandomEventsModule);
        gameCore.registerModule('map', MapModule);
        gameCore.registerModule('hotkeys', HotkeysModule);
        gameCore.registerModule('monitoring', MonitoringModule);
        gameCore.registerModule('rules', RulesModule);


        this.eventHandler.registerHandler('initialize-game', (data) => {
            // console.log('gameCoreBeforeInited', GameCore.instance);
            gameCore.initialize();
            // console.log('gameCoreInited', GameCore.instance);
            this.eventHandler.sendData('initialized', {...data, received: true});
            // console.log('sent initialized')
        })

        this.eventHandler.registerHandler('load-game', (data) => {
            // console.log('load-game received');
            this.loadGame(data);
        })

        this.eventHandler.registerHandler('reset-game', () => {

            // console.log('reset-game received');
            this.loadGame({}, true);
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
                'map': gameEntity.getLevel('shop_item_map') > 0,
                'world': gameEntity.getLevel('shop_item_map') > 0,
                'automations': gameEntity.getLevel('shop_item_planner') > 0,
                'courses': gameEntity.getLevel('shop_item_training_room') > 0,
                'amplifiers': gameEffects.getEffectValue('attribute_magic_ability') >= 12000,
            }
            let label = 'unlocks';
            if(payload?.prefix) {
                label = `${label}-${payload?.prefix}`;
            }
            this.eventHandler.sendData(label, unlocks);
        })

        this.eventHandler.registerHandler('get-save-string', ({ type }) => {

            function toBase64Unicode(str) {
                return btoa(unescape(encodeURIComponent(str)));
            }

            const saveObj = gameCore.save();
            this.eventHandler.sendData('saved-string', { string: toBase64Unicode(JSON.stringify(saveObj)), type });
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

    loadGame(data, isReset) {
        this.eventHandler.sendData('loading', {...data, received: true});
        gameCore.stopTicking();
        gameCore.load(data);
        // console.log('loaded game -/|');
        this.eventHandler.sendData('loaded', {...data, received: true, isReset});
    }

}

export const mainModule = () => MainModule.instance || new MainModule();