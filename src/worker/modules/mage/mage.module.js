import {GameModule} from "../../shared/game-module";
import { gameResources, gameEntity, gameEffects, gameCore } from 'game-framework';

export class MageModule extends GameModule {

    constructor() {
        super();
        this.mageLevel = 0;
        this.mageExp = 0;
        /*
        this.eventHandler.registerHandler('feed-dragon', (data) => {
            this.feedDragon();

        })
        this.eventHandler.registerHandler('hunt', (data) => {
            const rs = gameResources.getResource('meat');
            gameResources.addResource('meat', 1*rs.multiplier);
        })
         */
        this.eventHandler.registerHandler('query-mage-data', () => {
            const data = this.getMageData();
            this.eventHandler.sendData('mage-data', data);
        })

    }

    initialize() {
        gameResources.registerResource('mage-xp', {
            name: 'XP',
            hasCap: true,
            tags: ['mage', 'xp'],
            defaultCap: 0,
        })

        gameEffects.registerEffect('mageLevel', {
            name: 'Mage Level',
            defaultValue: 0,
            hasCap: false,
        })


        gameEffects.registerEffect('mage_levelup_requirement', {
            name: 'Mage Levelup Requirement',
            defaultValue: 1
        })

        const entity = gameEntity.registerGameEntity('mage', {
            tags: ["mage", "general"],
            name: 'Mage',
            level: 1,
            resourceModifier: {
                get_rawCap: () => ({
                    resources: {
                        'mage-xp': {
                            A: 1.2,
                            B: 100*gameEffects.getEffectValue('mage_levelup_requirement'),
                            type: 1,
                        },
                        'energy': {
                            A: 1,
                            B: 5,
                            type: 1
                        }
                    }
                }),
                get_income: () => ({
                    resources: {
                        energy: {
                            A: 0,
                            B: 0.01*gameEffects.getEffectValue('attribute_stamina'),
                            type: 0
                        }
                    }
                }),
                effectDeps: ['workersEfficiencyPerDragonLevel', 'mage_levelup_requirement', 'attribute_stamina']
            },
            get_cost: () => ({
                'mage-xp': {
                    A: 1.2,
                    B: 100*gameEffects.getEffectValue('mage_levelup_requirement'),
                    type: 1,
                }
            })
        });


    }

    tick() {
        const rs = gameResources.getResource('mage-xp');
        if(rs.amount >= rs.cap) {
            const rslt = gameEntity.levelUpEntity('mage');
            console.log('levelUp: ', rslt);
            // gameResources.addResource('perks', 1);
        }

    }

    save() {
        return {
            mageLevel: gameEntity.getLevel('mage'),
        }
    }

    reset() {
        this.load({})
    }

    load(obj) {
        this.mageLevel = obj?.mageLevel || 0;
        gameEntity.setEntityLevel('mage', this.mageLevel);
        console.log('[debugdrago] dragoEnt: ', gameEntity.getEntity('mage'));
    }

    getMageData() {
        const rs = gameResources.getResource('mage-xp');
        return {
            mageLevel: gameEntity.getLevel('mage'),
            mageXP: rs.amount,
            mageMaxXP: rs.cap,
            timeSpent: gameCore.globalTime,
        }
    }

}