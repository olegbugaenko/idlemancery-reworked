import {GameModule} from "./shared/game-module";
import { gameCore, GameCore, gameEntity } from 'game-framework';
import {MageModule} from "./modules/mage/mage.module";
import {ResourcePoolModule} from "./modules/resources/resource-pool.module";
import {ActionsModule} from "./modules/actions/actions.module";
import {AttributesModule} from "./modules/attributes/attributes.module";
import {ShopModule} from "./modules/items/shop.module";


export class MainModule extends GameModule {

    constructor() {
        super();
        gameCore.registerModule('attributes', AttributesModule);
        gameCore.registerModule('mage', MageModule);
        gameCore.registerModule('resource-pool', ResourcePoolModule);
        gameCore.registerModule('actions', ActionsModule);
        gameCore.registerModule('shop', ShopModule);



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
            const cheat = 1;
            console.log('gameCore', GameCore.instance);
            gameCore.startTicking(100, 0.1*cheat, () => {
                if(gameCore.numTicks % 100 === 0) {
                    this.save();
                }
            })
        })

        this.eventHandler.registerHandler('query-unlocks', () => {
            /*const unlocks = {
                population: gameEntity.getLevel('perk_dragon_cult') >= 1,
                upgrades: gameEntity.getLevel('perk_dragon_knowledge') >= 1,
                building: gameEntity.getLevel('upgrade_basic_construction') >= 1,
                army: gameEntity.getLevel('upgrade_war') >= 1,
                conquer: gameEntity.countEntitiesByTags(['soldier']) > 0,
                supplies: gameEntity.getLevel('upgrade_pottery') >= 1 || gameEntity.getLevel('upgrade_clothes_making') >=1,
                ascension: (gameEntity.getLevel('upgrade_ascension') >= 1) || (gameCore.getModule('ascension').numAscensions > 0)
            }*/
            const unlocks = {
                'actions': true,
                'shop': gameCore.getModule('shop').isUnlocked,
            }
            this.eventHandler.sendData('unlocks', unlocks);
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