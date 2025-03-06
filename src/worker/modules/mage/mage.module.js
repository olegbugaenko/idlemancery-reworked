import {GameModule} from "../../shared/game-module";
import {gameResources, gameEntity, gameEffects, gameCore, resourceModifiers} from 'game-framework';
import {registerSkillsStage1} from "./skills-db-v2";
import {registerPermanentBonuses} from "./permanent-bonuses-db";

export class MageModule extends GameModule {

    constructor() {
        super();
        this.mageLevel = 0;
        this.mageExp = 0;
        this.skillUpgrades = {};
        this.tourStatus = null;
        this.shouldSendSkills = false;
        this.bankedTime = {
            current: 0,
            max: 3600*24*1000,
            speedUpFactor: 1,
        };
        this.actualVersion = 3;
        this.currentVersion = 2;
        /*
        this.eventHandler.registerHandler('feed-dragon', (data) => {
            this.feedDragon();

        })
        this.eventHandler.registerHandler('hunt', (data) => {
            const rs = gameResources.getResource('meat');
            gameResources.addResource('meat', 1*rs.multiplier);
        })
         */

        this.eventHandler.registerHandler('set_tour_finished', ({ skipStep }) => {
            // console.log('TourFinished: ', skipStep);
            this.tourStatus = {
                isComplete: true,
                skipStep
            }
        })

        this.eventHandler.registerHandler('query_tour_status', () => {
            this.eventHandler.sendData('tour_status', this.tourStatus);
        })

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
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
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
        const ent = gameEntity.getEntity(itemId);

        if(ent.unlockBySkills?.length) {
            const isMatched = ent.unlockBySkills.some(unlock => unlock.level <= this.skillUpgrades[unlock.id]);
            if(!isMatched) {
                return ;
            }
        }

        const newEnt = gameEntity.levelUpEntity(itemId);
        console.log('Modifier: ', JSON.stringify(resourceModifiers.getModifier(`entity_${itemId}`)), resourceModifiers.getDependenciesToRegenerate(`entity_${itemId}`), gameResources.getResource('skill-points').balance);
        if(newEnt.success) {
            this.skillUpgrades[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            /*const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);*/
        }
        this.shouldSendSkills = true;
        return newEnt.success;
    }

    initialize() {

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
                            type: 0,
                            label: 'Attribute: Strength'
                        },
                        'health': {
                            A: 1,
                            B: 9 + gameEffects.getEffectValue('attribute_vitality'),
                            type: 1,
                            label: 'Attribute: Vitality'
                        },
                        'knowledge': {
                            A: 1,
                            B: gameEffects.getEffectValue('attribute_memory'),
                            type: 0,
                            label: 'Attribute: Memory'
                        },
                        mana: {
                            A: 0,
                            B: 0.5*(gameEffects.getEffectValue('attribute_magic_capability')-1),
                            type: 0,
                            label: 'Attribute: Magic Capability'
                        },
                        mental_energy: {
                            A: 0,
                            B: 0.5*(gameEffects.getEffectValue('attribute_willpower')-1),
                            type: 0,
                            label: 'Attribute: Willpower'
                        }
                    }
                }),
                get_income: () => ({
                    resources: {
                        energy: {
                            A: 0,
                            B: 0.01 + 0.01*gameEffects.getEffectValue('attribute_stamina'),
                            type: 0,
                            label: 'Attribute: Stamina'
                        },
                        health: {
                            A: 0,
                            B: 0.01*(0.5 + gameEffects.getEffectValue('attribute_recovery')),
                            type: 0,
                            label: 'Attribute: Recovery'
                        },
                        mana: {
                            A: 0,
                            B: 0.01*(5 + gameEffects.getEffectValue('attribute_magic_ability')),
                            type: 0,
                            label: 'Attribute: Magic Ability'
                        },
                        mental_energy: {
                            A: 0,
                            B: 0.01*(5 + gameEffects.getEffectValue('attribute_clarity')),
                            type: 0,
                            label: 'Attribute: Clarity'
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
                            B: 0.99 + 0.01*gameEffects.getEffectValue('attribute_bargaining')**0.75,
                            type: 0,
                            label: 'Attribute: Bargaining'
                        }
                    }
                }),
                effectDeps: ['workersEfficiencyPerDragonLevel', 'mage_levelup_requirement', 'attribute_stamina', 'attribute_strength', 'attribute_vitality','attribute_recovery', 'attribute_memory', 'attribute_magic_ability', 'attribute_magic_capability', 'attribute_bargaining', 'attribute_willpower', 'attribute_clarity']
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
        // console.log('RS: ', result);
        return result;
    }

    tick(game, dT) {
        this.leveledId = null;
        this.isLeveledUp = false;
        const rs = gameResources.getResource('mage-xp');
        if(rs.amount >= rs.cap) {
            const rslt = gameEntity.levelUpEntity('mage');
            // console.log('levelUp: ', rslt);
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
            this.bankedTime.current -= dT*(this.bankedTime?.speedUpFactor - 1)*1000/this.bankedTime?.speedUpFactor;
            if(this.bankedTime?.current <= 0) {
                this.bankedTime.current = 0;
                this.bankedTime.speedUpFactor = 1;
            }
        }

        if(this.shouldSendSkills) {
            this.shouldSendSkills = false;
            console.log('Sending skill through reassert');
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        }
        // console.log('A_TICK: ', this.bankedTime);

    }

    save() {
        return {
            mageLevel: gameEntity.getLevel('mage'),
            skillUpgrades: {
                skills: this.skillUpgrades,
                currentVersion: this.actualVersion,
            },
            permanentBonuses: gameEntity.listEntitiesByTags(['bonus', 'permanent']).map(one => ({ id: one.id, level: one.level })),
            bankedTime: {
                ...this.bankedTime,
                lastSave: Date.now()
            },
            tourStatus: this.tourStatus,
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
        if(obj?.skillUpgrades && obj?.skillUpgrades?.skills && obj?.skillUpgrades.currentVersion && obj?.skillUpgrades.currentVersion >= this.actualVersion) {
            for(const id in obj.skillUpgrades.skills) {
                if(gameEntity.entityExists(id)) {
                    this.setSkill(id, obj.skillUpgrades.skills[id], true);
                }
            }
        }
        const permanent = gameEntity.listEntitiesByTags(['bonus', 'permanent']).map(one => ({ id: one.id, level: one.level }));
        permanent.forEach(one => {
            gameEntity.setEntityLevel(one.id, 0, true);
        })
        if(obj?.permanentBonuses) {
            obj.permanentBonuses.forEach(({ id, level }) => {
                if(gameEntity.entityExists(id)) {
                    gameEntity.setEntityLevel(id, level, true);
                }
            })
        }
        this.bankedTime = {
            current: 0,
            max: 3600*24*1000,
            speedUpFactor: 1,
        };
        if(obj?.bankedTime) {
            this.bankedTime = obj?.bankedTime;
            if(this.bankedTime.max < 3600*24*1000) {
                this.bankedTime.max = 3600*24*1000;
            }
            if(Date.now() > this.bankedTime.lastSave + 60000) {
                const delta = Date.now() - (this.bankedTime.lastSave + 60000);
                this.bankedTime.current = Math.min(this.bankedTime.max, this.bankedTime.current + delta);
            }
            // console.log('loadedBankedTime: ', this.bankedTime, Date.now(), Date.now() - (this.bankedTime.lastSave + 60000))
        }
        this.tourStatus = obj?.tourStatus;
    }

    setSkill(skillId, amount, bForce = false) {
        gameEntity.setEntityLevel(skillId, amount, bForce);
        this.skillUpgrades[skillId] = gameEntity.getLevel(skillId);
    }

    resetPerks() {
        // console.log('resetPerks');
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
            skillPoints: skills.balance,
            timeSpent: gameCore.globalTime,
            isLeveledUp: this.isLeveledUp,
            bankedTime: this.bankedTime,
        }
    }

    getSkillsData() {
        const skills = gameEntity.listEntitiesByTags(['skill']);
        const skillsRs = gameResources.getResource('skill-points');
        console.log('rsData: ', skillsRs.balance);
        return {
            available: skills.map(entity => ({
                isUnlocked: entity.isUnlocked,
                id: entity.id,
                name: entity.name,
                position: entity.uiPosition,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id) || 0,
                level: this.skillUpgrades[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                effects: gameEntity.getEffects(entity.id, 1),
                currentEffects: gameEntity.getEffects(entity.id, 0),
                isLeveled: this.leveledId === entity.id,
                isCapped: entity.isCapped,
                icon: entity.icon,
                unlockBySkills: (entity.unlockBySkills || []).map(unlock => ({
                    ...unlock,
                    isMet: unlock.level <= this.skillUpgrades[unlock.id],
                })),
            })).reduce((acc, skill) => {
                skill.isRequirementsMet = !skill.unlockBySkills.length || skill.unlockBySkills.some(one => one.isMet);
                acc[skill.id] = skill;
                return acc;
                }, {}),
            sp: {
                total: skillsRs.balance,
                max: skillsRs.income,
            }
        }
    }

    getActiveEffectsData() {
        const items = gameEntity.listEntitiesByTags(['active_effect']);
        // const presentSpells = items.filter(item => item.isUnlocked);
        // console.log('[debug-error] activeEvents: ', items);

        return {
            list: items.map(item => ({
                ...item,
                originalId: item.originalId ?? item.copyFromId,
                effects: gameEntity.getEffects(item.id, item.level, 0, false, 1, item.modifier.efficiency),
                duration: gameEntity.getAttribute(item.id, 'current_duration'),
                durationProg: 1,
                className: gameEntity.getAttribute(item.id, 'className'),
            }))
        }
    }

    sendActiveEffectsData() {
        const activeEffectsData = this.getActiveEffectsData();

        this.eventHandler.sendData('active-effects', activeEffectsData);
    }

}