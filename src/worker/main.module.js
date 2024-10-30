import {GameModule} from "./shared/game-module";
import { gameCore, GameCore, gameEntity } from 'game-framework';
import {MageModule} from "./modules/mage/mage.module";
import {ResourcePoolModule} from "./modules/resources/resource-pool.module";
import {ActionsModule} from "./modules/actions/actions.module";
import {AttributesModule} from "./modules/attributes/attributes.module";
import {ShopModule} from "./modules/items/shop.module";
import {InventoryModule} from "./modules/inventory/inventory.module";
import {PropertyModule} from "./modules/property/property.module";
import {SpellModule} from "./modules/magic/spells.module";
import {CraftingModule} from "./modules/workshop/crafting.module";
import {prefix} from "react-beautiful-dnd/src/view/data-attributes";


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

        this.eventHandler.registerHandler('start-ticking', () => {
            const cheat = 4;
            console.log('gameCore', GameCore.instance);
            gameCore.startTicking(100, 0.1*cheat, () => {
                if(gameCore.numTicks % 100 === 0) {
                    this.save();
                }
            })
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
                'workshop': gameEntity.getLevel('shop_item_crafting_courses') > 0 || gameEntity.getLevel('shop_item_alchemy_courses') > 0
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