import {GameModule} from "../../shared/game-module";
import {gameResources, gameEntity, gameEffects, gameCore, resourceModifiers, resourceApi} from 'game-framework';
import {registerSkillsStage1} from "./skills-db-v2";
import {registerPermanentBonuses} from "./permanent-bonuses-db";
import {cloneDeep} from "lodash";
import {unlocksApi} from "game-framework/src/general/unlocks-api";
// import {initMageRanks} from "./mage-ranks-db";

export class MageModule extends GameModule {

    constructor() {
        super();
        this.mageLevel = 0;
        this.mageExp = 0;
        this.skillUpgrades = {};
        this.editModeSkills = null;
        this.currentEditEffects = null;
        this.tourStatus = null;
        this.shouldSendSkills = false;
        this.bankedTime = {
            current: 0,
            max: 3600*24*1000,
            speedUpFactor: 1,
        };
        this.actualVersion = 5;
        this.currentVersion = 5;
        this.skillsUnlock = {}; // Holds as key id of skill and as value array of skills that are unlocked BY this skill
        this.skillDrafts = {};
        this.isViewMode = false;
        /*
        this.eventHandler.registerHandler('feed-dragon', (data) => {
            this.feedDragon();

        })
        this.eventHandler.registerHandler('hunt', (data) => {
            const rs = gameResources.getResource('meat');
            gameResources.addResource('meat', 1*rs.multiplier);
        })
         */

        this.skillGroupsCached = {};

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

        this.eventHandler.registerHandler('query-mage-data', ({ prefix }) => {
            const data = this.getMageData();
            let label = 'mage-data';
            if(prefix) {
                label = `${label}-${prefix}`;
            }
            this.eventHandler.sendData(label, data);
        })

        this.eventHandler.registerHandler('query-skills-data', () => {
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('purchase-skill', ({ id }) => {
            this.addSkillLevel(id);
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('remove-skill', ({ id }) => {
            this.removeSkillLevel(id);
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('apply-skill-changes', ({ id }) => {
            this.applySkillChanges();
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('discard-skill-changes', ({ id }) => {
            this.discardSkillChanges();
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

        this.eventHandler.registerHandler('save-skill-draft', payload => {
            this.saveSkillDraft(payload.name);
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('delete-skill-draft', payload => {
            this.deleteSkillDraft(payload.id);
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('load-skill-draft', payload => {
            this.loadSkillDraft(payload.id, payload.isViewMode);
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('export-skill-draft', payload => {
            const blob = this.exportSkillDraft(payload.id);
            this.eventHandler.sendData('export-skill-draft-blob', blob);
        })

        this.eventHandler.registerHandler('import-skill-draft', payload => {
            this.importSkillDraft(payload.content);
            const data = this.getSkillsData();
            this.eventHandler.sendData('skills-data', data);
        })

        this.eventHandler.registerHandler('query-total-unlocks', () => {
            const data = unlocksApi.getGeneralUnlocksStats();
            this.eventHandler.sendData('total-unlocks', data);
        })
    }

    saveSkillDraft(name) {
        const draftId = `draft-${Date.now()}-${Math.random()}`;
        this.skillDrafts[draftId] = {
            id: draftId,
            name,
            timestamp: Date.now(),
            skills: cloneDeep(this.editModeSkills || this.skillUpgrades)
        };
        return this.skillDrafts[draftId];
    }

    /*loadSkillDraft(draftId) {
        const draft = this.skillDrafts[draftId];
        if (!draft) return false;

        this.editModeSkills = cloneDeep(draft.skills);
        this.currentEditEffects = this.getSkillTreeEffects(this.editModeSkills);
        return true;
    }*/

    loadSkillDraft(draftId, isViewMode = true) {
        const draft = this.skillDrafts[draftId];
        if (!draft) return false;

        this.isViewMode = isViewMode;

        if(!isViewMode) {
            if (this.canApplySkills(draft.skills)) {
                // 🎯 Мерджимо скіли, беручи максимальний рівень
                this.editModeSkills = { ...this.skillUpgrades };

                for (const skillId in draft.skills) {
                    this.editModeSkills[skillId] = Math.max(
                        this.editModeSkills[skillId] || 0,
                        draft.skills[skillId]
                    );
                }
                this.currentEditEffects = this.getSkillTreeEffects(this.editModeSkills);
            } else {
                // ❌ Якщо чернетку НЕ можна застосувати, просто показуємо її
                return false;
            }
        } else {
            this.editModeSkills = cloneDeep(draft.skills);
            this.currentEditEffects = this.getSkillTreeEffects(this.editModeSkills);
        }

        this.shouldSendSkills = true;

        return true;
    }


    deleteSkillDraft(draftId) {
        delete this.skillDrafts[draftId];
    }

    exportSkillDraft(draftId) {
        const draft = this.skillDrafts[draftId];
        if (!draft) return null;

        return draft;
    }

    importSkillDraft(fileContent) {
        try {
            const draft = JSON.parse(fileContent);

            if (!draft.name || !draft.skills) {
                this.eventHandler.sendData("import-skill-draft-error", {
                    error: "Invalid file format. Missing name or skills data.",
                });
                return null;
            }

            let isValid = true;
            let invalidSkills = [];

            for (const skillId in draft.skills) {
                const draftLevel = draft.skills[skillId];

                // 🔹 Перевіряємо, чи скіл існує у грі
                if (!gameEntity.entityExists(skillId)) {
                    isValid = false;
                    invalidSkills.push({ skillId, reason: "Skill does not exist." });
                    continue;
                }

                // 🔹 Перевіряємо, чи рівень не перевищує максимальний
                const maxLevel = gameEntity.getEntityMaxLevel(skillId);
                if (draftLevel > maxLevel) {
                    isValid = false;
                    invalidSkills.push({ skillId, reason: `Level ${draftLevel} exceeds max (${maxLevel}).` });
                }

                // 🔹 Перевіряємо, чи цей скіл має залежності (unlockBySkills)
                const entity = gameEntity.getEntity(skillId);
                if (draftLevel > 0 && entity.unlockBySkills?.length) {
                    const isUnlocked = entity.unlockBySkills.some(({ id, level }) => {
                        return (draft.skills[id] || 0) >= level;
                    });

                    if (!isUnlocked) {
                        isValid = false;
                        invalidSkills.push({ skillId, reason: "Skill has prerequisites that are not met." });
                    }
                }
            }

            if (!isValid) {
                this.eventHandler.sendData("import-skill-draft-error", {
                    error: "Some skills in the draft are invalid.",
                    details: invalidSkills,
                });
                return null;
            }

            // ✅ Якщо все валідно - додаємо чернетку
            const draftId = `draft-${Date.now()}-${Math.random()}`;
            this.skillDrafts[draftId] = { ...draft, id: draftId };

            // 🔹 Надсилаємо оновлений список чернеток на фронт
            this.eventHandler.sendData("skill-draft-updated", Object.values(this.skillDrafts));

            return draftId;
        } catch (error) {
            console.error("Invalid draft file:", error);
            this.eventHandler.sendData("import-skill-draft-error", {
                error: "Failed to parse JSON file. Please check the file format.",
            });
            return null;
        }
    }


    /*importSkillDraft(fileContent) {
        try {
            const draft = JSON.parse(fileContent);
            if (draft.name && draft.skills) {
                const draftId = `draft-${Date.now()}-${Math.random()}`;
                this.skillDrafts[draftId] = {...draft, id: draftId};
                return draftId;
            }
        } catch (error) {
            console.error("Invalid draft file:", error);
        }
        return null;
    }*/

    getSkillTreeEffects(skillTree) {
        if(!skillTree) {
            skillTree = {};
        }
        let totalEffects = {};
        const levelsByGroup = {};
        for(const skillId in skillTree) {
            if(this.skillGroupsCached[skillId]) {
                const groupId = this.skillGroupsCached[skillId];
                if(!levelsByGroup[groupId]) {
                    levelsByGroup[groupId] = {
                        totalLevel: 0,
                        protoSkillId: skillId,
                        allSkills: []
                    }
                }
                levelsByGroup[groupId].totalLevel += skillTree[skillId];
                levelsByGroup[groupId].allSkills.push(skillId);
                continue;
            }
            const entityEffects = gameEntity.getEffectsStructured(skillId, 0, skillTree[skillId]);
            //console.log('EffectsAsserted: ', entityEffects, totalEffects);
            let total = resourceApi.mergeEffects(totalEffects, entityEffects);
            //console.log('Merged: ', total);
        }
        //console.log('levelsByGroup', levelsByGroup);
        for(const groupId in levelsByGroup) {
            const entityEffects = gameEntity.getEffectsStructured(levelsByGroup[groupId].protoSkillId, 0, levelsByGroup[groupId].totalLevel);
            //console.log('GroupEffectsAsserted: ', entityEffects, totalEffects);
            let total = resourceApi.mergeEffects(totalEffects, entityEffects);
            //console.log('Merged: ', total);
        }
        console.log('totalEffects', totalEffects);
        return totalEffects;
    }

    getSkillTreeEffectsUnpacked(skillTree) {
        return resourceApi.unpackEffectsToObject(this.getSkillTreeEffects(skillTree));
    }

    getFreeSPLeft() {
        const total = gameResources.getResource('skill-points')?.income;
        const consume = this.currentEditEffects?.resources?.consumption?.['skill-points']?.value || 0;
        return total - consume;
    }

    canApplySkills(draftSkills) {
        if (!draftSkills) return false;

        let availablePoints = gameResources.getResource('skill-points')?.balance || 0;
        let requiredPoints = 0;

        for (const skillId in draftSkills) {
            const draftLevel = draftSkills[skillId] || 0;
            const currentLevel = this.skillUpgrades[skillId] || 0;

            if (draftLevel > currentLevel) {
                requiredPoints += (draftLevel - currentLevel);
            }
        }

        return requiredPoints <= availablePoints;
    }

    applySkillChanges() {
        if (!this.editModeSkills) {
            return; // Якщо немає змін, виходимо
        }

        if(!this.canApplySkills(this.editModeSkills)) {
            return;
        }

        // Копіюємо рівні скілів із редагування в основне дерево
        this.skillUpgrades = { ...this.editModeSkills };
        for(const key in this.skillUpgrades) {
            gameEntity.setEntityLevel(key, this.skillUpgrades[key], true);
        }

        // Очищаємо режим редагування
        this.editModeSkills = null;
        this.currentEditEffects = null;

        // Відправляємо оновлені дані
        this.shouldSendSkills = true;
    }

    discardSkillChanges() {
        this.isViewMode = false;
        if (!this.editModeSkills) {
            return; // Якщо режим редагування не активний, нічого не робимо
        }

        // Очищаємо тимчасові дані, залишаючи все як було
        this.editModeSkills = null;
        this.currentEditEffects = null;

        // Відправляємо оновлені дані без змін
        this.shouldSendSkills = true;
    }

    addSkillLevel(itemId) {
        const free = this.editModeSkills ? this.getFreeSPLeft() : gameResources.getResource('skill-points').balance;
        console.log('Free: ', free, this.currentEditEffects);
        if(!free) {
            return;
        }

        if(!this.editModeSkills) {
            this.editModeSkills = cloneDeep(this.skillUpgrades);
            this.currentEditEffects = this.getSkillTreeEffects(this.editModeSkills);
        }

        // do check if unlocked and if requirements are met
        if(!gameEntity.isEntityUnlocked(itemId)) {
            return;
        }
        // check if any of requirements are met
        const ent = gameEntity.getEntity(itemId);
        if(ent.unlockBySkills?.length) {
            const isMatched = ent.unlockBySkills.some(unlock => unlock.level <= this.editModeSkills[unlock.id]);
            if(!isMatched) {
                return ;
            }
        }
        if(gameEntity.getEntityMaxLevel(itemId) <= this.editModeSkills[itemId]) {
            return;
        }

        this.editModeSkills[itemId] = (this.editModeSkills[itemId] || 0) + 1;
        console.log('newEdit: ', this.editModeSkills, this.editModeSkills[itemId])

        // once finish edit
        this.currentEditEffects = this.getSkillTreeEffects(this.editModeSkills);

        console.log('AfterEdit: ', this.getFreeSPLeft(), this.currentEditEffects);

    }

    removeUnavailableSkills(skillId) {
        const dependents = this.skillsUnlock[skillId] || [];
        console.log('>>>>>> ', dependents);

        for (const dependent of dependents) {
            const { id: dependentId, level: requiredLevel } = dependent;
            const currentDependentLevel = this.editModeSkills[dependentId] || 0;

            // Якщо рівень залежного скіла більше 0, але він більше не відповідає вимогам
            if (currentDependentLevel > 0) {
                const unlockBySkills = gameEntity.getEntity(dependentId).unlockBySkills || [];

                // Перевіряємо, чи хоча б один із необхідних скілів більше не відповідає вимогам
                const isUnlocked = unlockBySkills.some(({ id, level }) => (this.editModeSkills[id] || 0) >= level);

                if (!isUnlocked) {
                    this.editModeSkills[dependentId] = 0; // Видаляємо скіл
                    this.removeUnavailableSkills(dependentId); // Рекурсивно перевіряємо наступний рівень залежностей
                }
            }
        }
    };

    removeSkillLevel(itemId) {
        if(!this.editModeSkills) {
            return; // Disable removal in non-edit mode
        }

        if(!this.editModeSkills[itemId]) {
            return;
        }

        if(this.editModeSkills[itemId] <= this.skillUpgrades[itemId]) {
            return;
        }

        // do check if unlocked and if requirements are met
        if(!gameEntity.isEntityUnlocked(itemId)) {
            return;
        }

        // Here we should recursively go over items that require this skill and set them to 0 in case not enough current level
        this.editModeSkills[itemId]--;

        this.removeUnavailableSkills(itemId); // Запускаємо рекурсивну перевірку

        // Після видалень оновлюємо загальні ефекти
        this.currentEditEffects = this.getSkillTreeEffects(this.editModeSkills);

        console.log('After Edit: ', this.getFreeSPLeft(), this.currentEditEffects);

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

        // this.mageRanks = initMageRanks()

        const list = gameEntity.listEntitiesByTags(['skill'], false, [], {
            bRawData: true,
        });

        list.forEach((item) => {
            if(item.unlockBySkills) {
                item.unlockBySkills.forEach(unlock => {
                    if(!this.skillsUnlock[unlock.id]) {
                        this.skillsUnlock[unlock.id] = [];
                    }
                    this.skillsUnlock[unlock.id].push({
                        level: unlock.level,
                        id: item.id
                    });
                })
            }
        })

        this.skillGroupsCached = list.filter(one => one.modifierGroupId).reduce((acc, skill) => {
            acc[skill.id] = skill.modifierGroupId;
            return acc;
        })

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

    /*getMageRank(level) {
        let rank = this.mageRanks[0]; // Default to the lowest rank

        for (const mageRank of this.mageRanks) {
            if (level >= mageRank.level) {
                rank = mageRank; // Update rank if level is sufficient
            } else {
                break; // Stop checking once we find a higher level rank
            }
        }

        console.log('MGR: ', rank, this.mageRanks)

        return rank;
    }

    reassertMageRank(level) {
        const rank = this.getMageRank(level);
        gameEntity.setEntityLevel('mage_rank', rank.rankLevel)
    }*/

    /*reassertCurrentMageLevel() {
        const level = gameEntity.getLevel('mage');
        return this.reassertMageRank(level);
    }*/

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
            // gameResources.addResource('skill-points', 1);
            this.isLeveledUp = true;
            const data = this.getMageData();
            // this.reassertCurrentMageLevel();
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
            drafts: this.skillDrafts,
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

        if(!this.skillUpgrades) {
            this.skillUpgrades = {};
        }

        if(obj?.drafts) {
            this.skillDrafts = obj?.drafts;
        }

        // this.reassertCurrentMageLevel();

        this.getSkillTreeEffects(this.skillUpgrades);
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
        // const rank = gameEntity.getLevel('mage_rank');
        // const rankData = this.getMageRank(gameEntity.getLevel('mage'));

        // console.log('rank: ', rankData);

        return {
            mageLevel: gameEntity.getLevel('mage'),
            mageXP: rs.amount,
            mageMaxXP: rs.cap,
            skillPoints: skills.balance,
            timeSpent: gameCore.globalTime,
            isLeveledUp: this.isLeveledUp,
            bankedTime: this.bankedTime,
            // rankData,
        }
    }

    getSkillsData() {
        const skills = gameEntity.listEntitiesByTags(['skill']);
        const skillsRs = gameResources.getResource('skill-points');
        console.log('rsData: ', cloneDeep(skillsRs));

        const currentEffects = this.getSkillTreeEffectsUnpacked(this.skillUpgrades);

        let potentialEffects = this.editModeSkills ? this.getSkillTreeEffectsUnpacked(this.editModeSkills) : null;

        return {
            available: skills.map(entity => ({
                isUnlocked: entity.isUnlocked,
                id: entity.id,
                name: entity.name,
                position: entity.uiPosition,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id) || 0,
                level: this.editModeSkills ? (this.editModeSkills[entity.id] || 0) : (this.skillUpgrades[entity.id] || 0),
                diff: this.editModeSkills ? (this.editModeSkills[entity.id] || 0) - (this.skillUpgrades[entity.id] || 0) : 0,
                affordable: gameEntity.getAffordable(entity.id),
                effects: gameEntity.getEffects(entity.id, 1, this.editModeSkills ? (this.editModeSkills[entity.id] || 0) : (this.skillUpgrades[entity.id] || 0)),
                currentEffects: gameEntity.getEffects(entity.id, 0, this.editModeSkills ? (this.editModeSkills[entity.id] || 0) : (this.skillUpgrades[entity.id] || 0)),
                isLeveled: this.leveledId === entity.id,
                isCapped: entity.isCapped,
                icon: entity.icon,
                unlockBySkills: (entity.unlockBySkills || []).map(unlock => ({
                    ...unlock,
                    isMet: unlock.level <= (this.editModeSkills ? (this.editModeSkills[unlock.id] || 0) : (this.skillUpgrades[unlock.id] || 0)),
                    relevantLevel: (this.editModeSkills ? (this.editModeSkills[unlock.id] || 0) : (this.skillUpgrades[unlock.id] || 0)),
                })),
            })).reduce((acc, skill) => {
                skill.isRequirementsMet = !skill.unlockBySkills.length || skill.unlockBySkills.some(one => one.isMet);
                acc[skill.id] = skill;
                return acc;
                }, {}),
            sp: {
                total: this.editModeSkills ? this.getFreeSPLeft() : skillsRs.balance,
                max: skillsRs.income,
                breakDown: {
                    income: skillsRs.breakDown?.income
                }
            },
            drafts: Object.entries(this.skillDrafts).map(([id, one]) => {
                const isAppliable = this.canApplySkills(one.skills); // Check if is applicable
                return {
                    id,
                    name: one.name,
                    timestamp: one.timestamp,
                    isAppliable,
                }
            }),
            currentEffects,
            potentialEffects,
            isEditMode: !!this.editModeSkills,
            isViewMode: this.isViewMode,
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