import {gameEntity, gameResources, resourceApi, resourceCalculators, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {initExpeditionsDB} from "./expeditions-db";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class ExpeditionsModule extends GameModule {

    constructor() {
        super();
        this.expeditions = {};
        this.isUnlocked = false;
        this.discoveredResources = {}; // Track discovered resources per expedition
        
        this.eventHandler.registerHandler('start-expedition', (payload) => {
            this.startExpedition(payload.id, payload.level);
        })
        
        this.eventHandler.registerHandler('stop-expedition', (payload) => {
            this.stopExpedition(payload.id);
        })
        
        this.eventHandler.registerHandler('query-expedition-data', (payload) => {
            this.sendExpeditionData(payload)
        })



        this.eventHandler.registerHandler('query-all-expeditions', payload => {
            this.sendAllExpeditions(payload);
        })

        this.eventHandler.registerHandler('query-expedition-details', (payload) => {
            this.sendExpeditionDetails(payload.id, payload.prefix, payload.level)
        })
    }

    initialize() {
        initExpeditionsDB();
    }

    setMonitored({ type, id }) {
        if(!id) {
            this.monitorData = null;
            return;
        }
        this.monitorData = {
            type,
            id
        }
    }

    getMonitoredData(entity) {
        if(!this.monitorData || !entity) return null;

        if(this.monitorData.type === 'expedition_efficiency') {
            if(entity.effectsDeps?.length && entity.effectsDeps.includes(this.monitorData.id)) {
                return 'produce';
            }
        }
    }

    isExpeditionLevelingAvailable() {
        return gameEntity.getLevel('action_expedition') > 0;
    }

    getMaxLevel(id) {
        const expedition = gameEntity.getEntity(id);
        if (!expedition) return 0;
        
        // Calculate max level based on XP earned for the highest achieved level
        const maxAchievedLevel = this.expeditions[id]?.maxAchievedLevel || 0;
        const currentXp = this.expeditions[id]?.xp || 0;
        const baseXp = expedition.baseXp || expedition.attributes?.baseXp || 1000;
        
        // Each level requires baseXp * 3^level XP
        const requiredXp = baseXp * Math.pow(3, maxAchievedLevel);
        
        if (currentXp >= requiredXp) {
            return maxAchievedLevel + 1;
        }
        
        return maxAchievedLevel;
    }





    getCurrentXp(id) {
        if (!this.expeditions[id]) return 0;
        return this.expeditions[id].xp || 0;
    }

    getRequiredXpForNextLevel(id) {
        const expedition = gameEntity.getEntity(id);
        if (!expedition) return 0;
        
        const maxAchievedLevel = this.expeditions[id]?.maxAchievedLevel || 0;
        const baseXp = expedition.baseXp || expedition.attributes?.baseXp || 1000;
        
        // Each level requires baseXp * 3^level XP (for the next level after maxAchievedLevel)
        const requiredXp = baseXp * Math.pow(3, maxAchievedLevel);
        
        return requiredXp;
    }

    calculateLoot(locationId, level, efficiency = null) {
        const expedition = gameEntity.getEntity(locationId);
        if (!expedition || !expedition.attributes?.possibleLoot) {
            return [];
        }

        // Determine efficiency
        let actualEfficiency = efficiency;
        if (actualEfficiency === null) {
            // Check if expedition is currently running
            if (this.expeditions[locationId]?.isRunning) {
                const activeEntity = gameEntity.getEntity(`activeExpedition_${locationId}`);
                if (activeEntity) {
                    // Get efficiency from resource modifier calculation
                    actualEfficiency = gameEntity.getEntity(activeEntity.id)?.efficiency || 1;
                } else {
                    actualEfficiency = 1;
                }
            } else {
                actualEfficiency = 1;
            }
        }

        const possibleLoot = expedition.attributes.possibleLoot;
        const lootResults = [];

        for (const itemId in possibleLoot) {
            const baseMult = possibleLoot[itemId];
            
            // probability = efficiency * multiplier * 0.1
            const probability = actualEfficiency * baseMult * 0.025 * (4 + level**0.25);
            
            // amount = efficiency * multiplier * (1.1^level) * expedition_resource_amount
            const resourceAmountMultiplier = gameEffects.getEffectValue('expedition_resource_amount');
            const amount = actualEfficiency * 1 * (1 + level**0.5) * Math.pow(1.1, level) * resourceAmountMultiplier;
            
            lootResults.push({
                id: itemId,
                probability: Math.min(1, probability), // Cap at 100%
                amount: Math.max(1, Math.round(amount)) // Minimum 1, rounded
            });
        }

        console.log('loot: ', gameEffects.getEffectValue('expedition_resource_amount'), lootResults);

        return lootResults;
    }

    tick(game, delta) {
        // Update XP for active expeditions and handle loot finding
        for (const expeditionId in this.expeditions) {
            const expedition = this.expeditions[expeditionId];
            if (expedition.isRunning) {
                // Get expedition entity to calculate effort consumption
                const expeditionEntity = gameEntity.getEntity(expeditionId);
                if (!expeditionEntity || !expeditionEntity.resourceModifier) continue;
                
                // Calculate effort consumed by this specific expedition
                const consumpt = gameResources.getResource('expedition_effort').consumption;
                if (consumpt > 0 && gameResources.getResource('expedition_effort').income) {
                    const effortConsumed = consumpt * delta;
                    const xpRate = gameEffects.getEffectValue('expedition_xp_rate');
                    
                    // XP gained = expedition_effort_consumed * expedition_xp_rate
                    const xpGained = effortConsumed * xpRate;
                    
                    expedition.xp = (expedition.xp || 0) + xpGained;
                    
                    // Calculate and distribute loot
                    const lootResults = this.calculateLoot(expeditionId, expedition.level);
                    for (const loot of lootResults) {
                        // Check if we should find this item based on probability
                        if (Math.random() < loot.probability * delta) {
                            gameResources.addResource(loot.id, loot.amount);
                            
                            // Mark resource as discovered for this expedition
                            this.markResourceDiscovered(expeditionId, loot.id);
                        }
                    }
                    
                    // Check if we can unlock next level
                    const maxLevel = this.getMaxLevel(expeditionId);
                    if (maxLevel > expedition.maxAchievedLevel) {
                        // Update maxAchievedLevel when we can level up
                        expedition.maxAchievedLevel = Math.max(expedition.maxAchievedLevel || 0, maxLevel);
                        // Reset XP when leveling up
                        expedition.xp = 0;
                    }
                }
            }
        }
    }

    save() {
        return {
            expeditions: this.expeditions,
            discoveredResources: this.discoveredResources
        }
    }

    load(saveObject) {
        this.expeditions = saveObject?.expeditions || {};
        this.discoveredResources = saveObject?.discoveredResources || {};
        
        // Migrate old Set-based discoveredResources to arrays
        for (const expeditionId in this.discoveredResources) {
            const discovered = this.discoveredResources[expeditionId];
            // If it's not an array, convert it
            if (!Array.isArray(discovered)) {
                if (discovered && typeof discovered === 'object') {
                    // If it's a Set-like object, try to extract values
                    if (discovered.constructor && discovered.constructor.name === 'Set') {
                        this.discoveredResources[expeditionId] = Array.from(discovered);
                    } else {
                        // If it's an object, try to get values or keys
                        this.discoveredResources[expeditionId] = Object.values(discovered).length > 0 
                            ? Object.values(discovered) 
                            : Object.keys(discovered);
                    }
                } else {
                    // Fallback to empty array
                    this.discoveredResources[expeditionId] = [];
                }
            }
        }
        
        // Restore active expedition entities
        for (const expeditionId in this.expeditions) {
            const expedition = this.expeditions[expeditionId];
            if (expedition.isRunning) {
                const expeditionEntity = gameEntity.getEntity(expeditionId);
                if (expeditionEntity) {
                    // Recreate active expedition entity
                    gameEntity.registerGameEntity(`activeExpedition_${expeditionId}`, {
                        copyFromId: expeditionId,
                        isAbstract: false,
                        level: expedition.level,
                        tags: ['active_expedition', 'active_effect'],
                        scope: 'expeditions',
                        unlockedBy: undefined,
                    });
                    
                    gameEntity.setEntityLevel(`activeExpedition_${expeditionId}`, expedition.level);
                }
            }
        }
    }

    reset() {
        this.expeditions = {};
        this.discoveredResources = {};
    }

    startExpedition(id, level = 0) {
        const expedition = gameEntity.getEntity(id);
        
        if (!expedition) {
            console.warn(`Expedition ${id} not found`);
            return;
        }

        // Initialize expedition data if not exists
        if (!this.expeditions[id]) {
            this.expeditions[id] = {
                level: 0,
                xp: 0,
                maxAchievedLevel: 0,
                isRunning: false
            }
        }

        // Check if expedition is already running
        if (this.expeditions[id].isRunning) {
            return;
        }

        // Stop all other running expeditions
        Object.keys(this.expeditions).forEach(expeditionId => {
            if (expeditionId !== id && this.expeditions[expeditionId].isRunning) {
                this.stopExpedition(expeditionId);
            }
        });

        // Check if level is available
        const maxLevel = this.getMaxLevel(id);
        if (level > maxLevel) {
            console.warn(`Level ${level} not available for expedition ${id}. Max level: ${maxLevel}`);
            return;
        }



        // Start the expedition
        this.expeditions[id].isRunning = true;
        this.expeditions[id].level = level;
        this.expeditions[id].startTime = Date.now();

        // Register active expedition entity
        gameEntity.registerGameEntity(`activeExpedition_${id}`, {
            copyFromId: id,
            isAbstract: false,
            level: level,
            tags: ['active_expedition', 'active_effect'],
            scope: 'expeditions',
            unlockedBy: undefined,
        });

        gameEntity.setEntityLevel(`activeExpedition_${id}`, level);

        // Consume expedition effort
        // gameResources.addResource('expedition_effort', -requiredEffort);

        this.sendExpeditionData();
    }

    stopExpedition(id) {
        if (!this.expeditions[id] || !this.expeditions[id].isRunning) {
            return;
        }

        // Stop the expedition
        this.expeditions[id].isRunning = false;

        // Unregister active expedition entity
        gameEntity.unsetEntity(`activeExpedition_${id}`);

        this.sendExpeditionData();
    }

    getExpeditionsData(payload) {
        // Показуємо лише відкриті експедиції
        const expeditions = gameEntity
            .listEntitiesByTags(['expedition-location'])
            .filter(exp => gameEntity.isEntityUnlocked(exp.id));
        return {
            expeditions: expeditions.map(expedition => {
                const expeditionData = this.expeditions[expedition.id] || {
                    level: 0,
                    xp: 0,
                    maxAchievedLevel: 0,
                    isRunning: false
                };

                const maxLevel = this.getMaxLevel(expedition.id);
                const currentXp = this.getCurrentXp(expedition.id);
                const requiredXp = this.getRequiredXpForNextLevel(expedition.id);

                return {
                    id: expedition.id,
                    name: expedition.name,
                    description: expedition.description,
                    level: expeditionData.level,
                    maxLevel: maxLevel,
                    isRunning: expeditionData.isRunning,
                    currentXp: currentXp,
                    requiredXp: requiredXp,
                    isUnlocked: true
                };
            }),
            expeditionEffort: {
                ...gameResources.getResource('expedition_effort'),
                isPinned: !!gameCore.getModule('resource-pool').pinnedResources?.['expedition_effort']
            }
        };
    }

    sendExpeditionData(payload) {
        const data = this.getExpeditionsData(payload);
        this.eventHandler.sendData('expedition-data', data);
    }

    getExpeditionDetails(id, overrideLevel = null) {
        if(!id) return null;
        const expedition = gameEntity.getEntity(id);
        const expeditionData = this.expeditions[id] || {
            level: 0,
            xp: 0,
            maxAchievedLevel: 0,
            isRunning: false
        };

        const maxLevel = this.getMaxLevel(id);
        const currentXp = this.getCurrentXp(id);
        const requiredXp = this.getRequiredXpForNextLevel(id);
        
        // Use override level if provided, otherwise use expedition level
        const levelToUse = overrideLevel !== null ? overrideLevel : expeditionData.level;

        // Calculate possible loot for the level being viewed
        const possibleLoot = this.calculateLoot(id, levelToUse).map(loot => ({
            ...loot,
            resourceName: gameResources.getResource(loot.id)?.name || loot.id
        }));

        // Filter loot to show only discovered resources
        const discoveredResourceIds = this.getDiscoveredResources(id);
        const discoveredLoot = possibleLoot.filter(loot => 
            this.isResourceDiscovered(id, loot.id)
        );
        const hiddenLootCount = possibleLoot.length - discoveredLoot.length;

        return {
            id: expedition.id,
            name: expedition.name,
            description: expedition.description,
            level: levelToUse,
            maxLevel: maxLevel,
            isRunning: expeditionData.isRunning,
            currentXp: currentXp,
            requiredXp: requiredXp,
            potentialEffects: gameEntity.getEffects(id, 0, levelToUse, true),
            possibleLoot: possibleLoot,
            discoveredLoot: discoveredLoot,
            hiddenLootCount: hiddenLootCount,
            isUnlocked: expedition.unlockCondition ? expedition.unlockCondition() : true
        };
    }

    sendExpeditionDetails(id, prefix, level = null) {
        const data = this.getExpeditionDetails(id, level);
        let label = 'expedition-details';
        if(prefix) {
            label = `${prefix}-${label}`;
        }
        this.eventHandler.sendData(label, data);
    }

    getAllExpeditionsData() {
        return this.getExpeditionsData();
    }

    sendAllExpeditions(payload) {
        const data = this.getAllExpeditionsData();
        this.eventHandler.sendData('all-expeditions', data);
    }

    isRecipeUnlocked(artifactId) {
        return this.unlockedRecipes.includes(artifactId);
    }

    markResourceDiscovered(expeditionId, resourceId) {
        if (!this.discoveredResources[expeditionId]) {
            this.discoveredResources[expeditionId] = [];
        }
        if (!this.discoveredResources[expeditionId].includes(resourceId)) {
            this.discoveredResources[expeditionId].push(resourceId);
        }
    }

    getDiscoveredResources(expeditionId) {
        return this.discoveredResources[expeditionId] || [];
    }

    isResourceDiscovered(expeditionId, resourceId) {
        return this.discoveredResources[expeditionId]?.includes(resourceId) || false;
    }
} 