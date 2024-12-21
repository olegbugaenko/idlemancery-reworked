import {GameModule} from "../../shared/game-module";
import { gameResources, gameEntity, gameEffects, gameCore } from 'game-framework';
import {registerSkillsStage1} from "./skills-db";
import {registerPermanentBonuses} from "./permanent-bonuses-db";

export class MageModule extends GameModule {

    constructor() {
        super();
        this.mageLevel = 0;
        this.mageExp = 0;
        this.skillUpgrades = {};
        this.bankedTime = {
            current: 0,
            max: 3600*24*1000,
            speedUpFactor: 1,
        };
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

        this.eventHandler.registerHandler('toggle-speedup', () => {
            this.bankedTime.speedUpFactor = 5 - this.bankedTime.speedUpFactor;
        })

        this.eventHandler.registerHandler('query-active-effects', () => {
            this.sendActiveEffectsData();
        })

        this.eventHandler.registerHandler('query-statistics', () => {
            const data = this.getStatistics();
            this.eventHandler.sendData('statistics', data);
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

        registerPermanentBonuses();

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

    topValues(data) {
        return (data || []).sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }

    getStatistics() {
        const result = {};
        result.totalTimePlayed = gameCore.globalTime;
        result.mageLevel = this.mageLevel;
        result.actionsUnlocked = gameEntity.listEntitiesByTags(['action']).filter(one => gameEntity.isEntityUnlocked(one.id)).length;
        result.actionTimes = this.topValues(Object.entries(gameCore.getModule('actions').actions).map(([id, action]) => {
            return {
                name: gameEntity.getEntity(id).name,
                value: action.timeInvested
            }
        }))
        result.actionXP = this.topValues(Object.entries(gameCore.getModule('actions').actions).map(([id, action]) => {
            return {
                name: gameEntity.getEntity(id).name,
                value: action.xpEarned
            }
        }))
        result.spellsCasted = this.topValues(Object.entries(gameCore.getModule('magic').spells).map(([id, spell]) => {
            return {
                name: gameEntity.getEntity(id).name,
                value: spell.numCasted
            }
        }))
        console.log('RS: ', result);
        return result;
    }

    tick(game, dT) {
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

        // console.log('B_TICK: ', this.bankedTime)
        if(!this.bankedTime.current) {
            this.bankedTime.current = 0;
        }

        if(this.bankedTime?.speedUpFactor > 1) {
            this.bankedTime.current -= dT*(this.bankedTime?.speedUpFactor - 1)*1000;
            if(this.bankedTime?.current <= 0) {
                this.bankedTime.current = 0;
                this.bankedTime.speedUpFactor = 1;
            }
        }
        // console.log('A_TICK: ', this.bankedTime);

    }

    save() {
        return {
            mageLevel: gameEntity.getLevel('mage'),
            skillUpgrades: this.skillUpgrades,
            permanentBonuses: gameEntity.listEntitiesByTags(['bonus', 'permanent']).map(one => ({ id: one.id, level: one.level })),
            bankedTime: {
                ...this.bankedTime,
                lastSave: Date.now()
            }
        }
    }

    reset() {
        this.load({})
    }

    load(obj) {
        this.mageLevel = obj?.mageLevel || 1;
        gameEntity.setEntityLevel('mage', this.mageLevel);

        for(const key in this.skillUpgrades) {
            this.setSkill(key, 0, true);
        }
        this.skillUpgrades = {};
        if(obj?.skillUpgrades) {
            for(const id in obj.skillUpgrades) {
                this.setSkill(id, obj.skillUpgrades[id], true);
            }
        }
        const permanent = gameEntity.listEntitiesByTags(['bonus', 'permanent']).map(one => ({ id: one.id, level: one.level }));
        permanent.forEach(one => {
            gameEntity.setEntityLevel(one.id, 0, true);
        })
        if(obj?.permanentBonuses) {
            obj.permanentBonuses.forEach(({ id, level }) => {
                gameEntity.setEntityLevel(id, level, true);
            })
        }
        this.bankedTime = {
            current: 0,
            max: 3600*24*1000,
            speedUpFactor: 1,
        };
        if(obj?.bankedTime) {
            this.bankedTime = obj?.bankedTime;
            if(Date.now() > this.bankedTime.lastSave + 60000) {
                const delta = Date.now() - (this.bankedTime.lastSave + 60000);
                this.bankedTime.current = Math.min(this.bankedTime.max, this.bankedTime.current + delta);
            }
            console.log('loadedBankedTime: ', this.bankedTime, Date.now(), Date.now() - (this.bankedTime.lastSave + 60000))
        }
    }

    setSkill(skillId, amount, bForce = false) {
        gameEntity.setEntityLevel(skillId, amount, bForce);
        this.skillUpgrades[skillId] = gameEntity.getLevel(skillId);
    }

    resetPerks() {
        console.log('resetPerks');
        for(const id in this.skillUpgrades) {
            this.setSkill(id, 0, true);
        }
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
            bankedTime: this.bankedTime,
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