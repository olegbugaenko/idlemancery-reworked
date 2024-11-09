import {GameModule} from "../../shared/game-module";
import { gameResources, gameEntity, gameEffects, gameCore } from 'game-framework';
import {registerSkillsStage1} from "./skills-db";

export class MageModule extends GameModule {

    constructor() {
        super();
        this.mageLevel = 0;
        this.mageExp = 0;
        this.skillUpgrades = {};
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

        this.eventHandler.registerHandler('query-skills-data', () => {
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('purchase-skill', ({ id }) => {
            this.purchaseItem(id);
        })

        this.eventHandler.registerHandler('query-active-effects', () => {
            this.sendActiveEffectsData();
        })

    }

    purchaseItem(itemId) {
        const newEnt = gameEntity.levelUpEntity(itemId);
        if(newEnt.success) {
            this.skillUpgrades[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        }
        return newEnt.success;
    }

    initialize() {
        gameResources.registerResource('mage-xp', {
            name: 'XP',
            hasCap: true,
            tags: ['mage', 'xp'],
            defaultCap: 0,
        })

        gameResources.registerResource('skill-points', {
            name: 'Skill Points',
            hasCap: true,
            tags: ['mage', 'skill'],
            defaultCap: 0,
            isService: true,
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

        registerSkillsStage1();

        const entity = gameEntity.registerGameEntity('mage', {
            tags: ["mage", "general"],
            name: 'Mage',
            level: 1,
            resourceModifier: {
                get_rawCap: () => ({
                    resources: {
                        'mage-xp': {
                            A: 1.3,
                            B: 200,
                            type: 1,
                        },
                        'energy': {
                            A: 1,
                            B: 9 + gameEffects.getEffectValue('attribute_strength'),
                            type: 0
                        },
                        'health': {
                            A: 1,
                            B: 9 + gameEffects.getEffectValue('attribute_vitality'),
                            type: 1
                        },
                        'knowledge': {
                            A: 1,
                            B: gameEffects.getEffectValue('attribute_memory'),
                            type: 0
                        },
                        mana: {
                            A: 0,
                            B: 0.5*(gameEffects.getEffectValue('attribute_magic_capability')-1),
                            type: 0
                        }
                    }
                }),
                get_income: () => ({
                    resources: {
                        energy: {
                            A: 0,
                            B: 0.01 + 0.01*gameEffects.getEffectValue('attribute_stamina'),
                            type: 0
                        },
                        health: {
                            A: 0,
                            B: 0.01*(0.5 + gameEffects.getEffectValue('attribute_recovery')),
                            type: 0
                        },
                        mana: {
                            A: 0,
                            B: 0.01*(5 + gameEffects.getEffectValue('attribute_magic_ability')),
                            type: 0
                        },
                        'skill-points': {
                            A: 1,
                            B: -1,
                            type: 0,
                        }
                    }
                }),
                get_multiplier: () => ({
                    resources: {
                        coins: {
                            A: 0,
                            B: 0.99 + 0.01*gameEffects.getEffectValue('attribute_bargaining'),
                            type: 0,
                        }
                    }
                }),
                effectDeps: ['workersEfficiencyPerDragonLevel', 'mage_levelup_requirement', 'attribute_stamina', 'attribute_strength', 'attribute_vitality','attribute_recovery', 'attribute_memory', 'attribute_magic_ability', 'attribute_magic_capability', 'attribute_bargaining']
            },
            get_cost: () => ({
                'mage-xp': {
                    A: 1.3,
                    B: 200,
                    type: 1,
                }
            })
        });


    }

    tick() {
        this.leveledId = null;
        this.isLeveledUp = false;
        const rs = gameResources.getResource('mage-xp');
        if(rs.amount >= rs.cap) {
            const rslt = gameEntity.levelUpEntity('mage');
            console.log('levelUp: ', rslt);
            gameResources.addResource('skill-points', 1);
            this.isLeveledUp = true;
            const data = this.getMageData();
            this.eventHandler.sendData('mage-data', data);
        }

    }

    save() {
        return {
            mageLevel: gameEntity.getLevel('mage'),
            skillUpgrades: this.skillUpgrades,
        }
    }

    reset() {
        this.load({})
    }

    load(obj) {
        this.mageLevel = obj?.mageLevel || 0;
        gameEntity.setEntityLevel('mage', this.mageLevel);
        console.log('[debugdrago] dragoEnt: ', gameEntity.getEntity('mage'));

        for(const key in this.skillUpgrades) {
            this.setSkill(key, 0, true);
        }
        this.skillUpgrades = {};
        if(obj?.skillUpgrades) {
            for(const id in obj.skillUpgrades) {
                this.setSkill(id, obj.skillUpgrades[id], true);
            }
        }
        // this.sen();
    }

    setSkill(skillId, amount, bForce = false) {
        gameEntity.setEntityLevel(skillId, amount, bForce);
        this.skillUpgrades[skillId] = gameEntity.getLevel(skillId);
    }

    getMageData() {
        const rs = gameResources.getResource('mage-xp');
        const skills = gameResources.getResource('skill-points');
        return {
            mageLevel: gameEntity.getLevel('mage'),
            mageXP: rs.amount,
            mageMaxXP: rs.cap,
            skillPoints: skills.amount,
            timeSpent: gameCore.globalTime,
            isLeveledUp: this.isLeveledUp,
        }
    }

    getSkillsData() {
        const skills = gameEntity.listEntitiesByTags(['skill']);
        const skillsRs = gameResources.getResource('skill-points');
        return {
            available: skills.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id) || 0,
                level: this.skillUpgrades[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                effects: gameEntity.getEffects(entity.id, 1),
                currentEffects: gameEntity.getEffects(entity.id, 0),
                isLeveled: this.leveledId === entity.id
            })),
            sp: {
                total: skillsRs.amount,
                max: skillsRs.income,
            }
        }
    }

    getActiveEffectsData() {
        const items = gameEntity.listEntitiesByTags(['active_effect']);
        // const presentSpells = items.filter(item => item.isUnlocked);

        return {
            list: items.map(item => ({
                ...item,
                originalId: item.originalId ?? item.copyFromId,
                effects: gameEntity.getEffects(item.id, item.level, 0, false, 1, item.modifier.efficiency),
                duration: gameEntity.getAttribute(item.id, 'current_duration'),
                durationProg: 1
            }))
        }
    }

    sendActiveEffectsData() {
        const activeEffectsData = this.getActiveEffectsData();

        this.eventHandler.sendData('active-effects', activeEffectsData);
    }

}