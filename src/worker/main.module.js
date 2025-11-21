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
import {ArtifactsCraftingModule} from "./modules/workshop/artifacts-crafting.module";
import {ZooModule} from "./modules/workshop/zoo.module";
import {UnlockNotificationsModule} from "./shared/modules/unlock-notifications.module";
import {RandomEventsModule} from "./modules/general/random-events.module";
import {TemporaryEffectsModule} from "./modules/general/temporary-effects.module";
import {MapModule} from "./modules/map/map.module";
import {HotkeysModule} from "./shared/modules/hotkeys.module";
import {MonitoringModule} from "./shared/modules/monitoring.module";
import {RulesModule} from "./shared/modules/rules.module";
import {CoursesModule} from "./modules/items/courses.module";
import {AchievementsModule} from "./modules/mage/achievements.module";
import {EventsModule} from "./modules/social/social-events.module";
import {StatisticsModule} from "./modules/statistics/statistics.module";
import {FavoritesModule} from "./modules/favorites/favorites.module";
import {ExpeditionsModule} from "./modules/expeditions/expeditions.module";


export class MainModule extends GameModule {

    constructor() {
        super();

        // Compatibility: older code paths rely on gameResources.resourceExists,
        // which is not provided by the current game-framework bundle.
        if (typeof gameResources.resourceExists !== 'function') {
            gameResources.resourceExists = (id) => !!gameResources.getResource(id);
        }
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
        gameCore.registerModule('artifacts-crafting', ArtifactsCraftingModule);
        gameCore.registerModule('zoo', ZooModule);
        gameCore.registerModule('unlock-notifications', UnlockNotificationsModule);
        //gameCore.registerModule('random-events', RandomEventsModule);
        gameCore.registerModule('map', MapModule);
        gameCore.registerModule('hotkeys', HotkeysModule);
        gameCore.registerModule('monitoring', MonitoringModule);
        gameCore.registerModule('rules', RulesModule);
        gameCore.registerModule('achievements', AchievementsModule);
        gameCore.registerModule('events', EventsModule);
        gameCore.registerModule('statistics', StatisticsModule);
        gameCore.registerModule('favorites', FavoritesModule);
        gameCore.registerModule('expeditions', ExpeditionsModule);


        this.eventHandler.registerHandler('initialize-game', (data) => {
            gameCore.initialize({ is_demo: data.is_demo ? +data.is_demo : 0 });
            this.eventHandler.sendData('initialized', {...data, received: true});
        })

        this.eventHandler.registerHandler('load-game', (data) => {
            this.loadGame(data);
        })

        this.eventHandler.registerHandler('reset-game', () => {

            this.loadGame({}, true);
        })

        this.eventHandler.registerHandler('start-ticking', () => {
            const cheat = 1;
            // const speedUpMode = gameCore.getModule('mage').bankedTime?.speedUpFactor ?? 1;
            gameCore.startTicking(100, () => 0.1*cheat*(gameCore.getModule('mage').bankedTime?.speedUpFactor ?? 1), () => {
                if(gameCore.numTicks % 100 === 0) {
                    this.save();
                }
            }, false)
        })

        this.eventHandler.registerHandler('trigger-hotkey', (payload) => {
            const hotkeysModule = gameCore.getModule('hotkeys');
            if (hotkeysModule) {
                hotkeysModule.eventHandler.sendData('trigger-hotkey', payload);
            }
        })

        this.eventHandler.registerHandler('query-unlocks', (payload) => {
            const plantationSlots = gameResources.getResource('plantation_slots');
            const zooSpace = gameResources.getResource('magic_zoo_space');
            const unlocks = {
                'actions': true,
                'actionLists': gameEntity.getLevel('shop_item_notebook') > 0,
                'shop': gameCore.getModule('shop').isUnlocked,
                'inventory': gameEntity.getLevel('shop_item_backpack') > 0,
                'property': gameEntity.getLevel('shop_item_tent') > 0,
                'structures': gameEntity.getLevel('shop_item_constructing') > 0,
                'magic': gameEntity.getLevel('shop_item_spellbook') > 0,
                'spellbook': gameEntity.getLevel('shop_item_spellbook') > 0,
                'crafting': gameEntity.getLevel('shop_item_crafting_courses') > 0,
                'alchemy': gameEntity.getLevel('shop_item_alchemy_courses') > 0,
                'workshop': gameEntity.getLevel('shop_item_crafting_courses') > 0 || gameEntity.getLevel('shop_item_alchemy_courses') > 0 || (plantationSlots?.income || 0) > 0,
                'artifacts': gameEntity.isEntityUnlocked('action_expedition'),
                'plantation': (plantationSlots?.income || 0) > 0,
                'zoo': (zooSpace?.income || 0) > 0,
                'guilds': gameEffects.getEffectValue('attribute_charisma') >= 500,
                'social': gameEntity.getLevel('structure_event_hall') > 0,
                'map': gameEntity.getLevel('shop_item_map') > 0,
                'world': gameEntity.getLevel('shop_item_map') > 0,
                'automations': gameEntity.getLevel('shop_item_planner') > 0,
                'courses': gameEntity.getLevel('shop_item_training_room') > 0,
                'amplifiers': gameEffects.getEffectValue('attribute_magic_ability') >= 15000,
                'machinery': gameEntity.getLevel('shop_item_automated_mechanisms') > 0,
                'events': gameEntity.getLevel('structure_event_hall') > 0,
                'social-main': gameEntity.getLevel('structure_event_hall') > 0,
                'expeditions': gameEntity.isEntityUnlocked('action_expedition'),
                'amnesia': gameEntity.getLevel('shop_item_alchemy_courses') > 0,
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
        this.eventHandler.sendData('loaded', {...data, received: true, isReset});
    }

}

export const mainModule = () => MainModule.instance || new MainModule();