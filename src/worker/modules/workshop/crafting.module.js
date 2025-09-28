import {GameModule} from "../../shared/game-module";
import {registerCraftingRecipes} from "./recipes-db";
import {gameCore, gameEffects, gameEntity, gameResources, resourceCalculators} from "game-framework";
import {CraftingListsSubmodule} from "./crafting-lists.submodule";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class CraftingModule extends GameModule {

    constructor(props) {
        super(props);

        this.lists = new CraftingListsSubmodule();

        this.currentVersion = 2;

        this.craftingSlots = {};

        // Auto-rebalancing system
        this.autoRebalanceEnabled = false;
        this.originalAllocations = {}; // Store original player allocations
        this.lastRebalanceCheck = 0;
        this.rebalanceCheckInterval = 3; // Check every 3 seconds

        // Alchemy auto-rebalancing system (separate from crafting)
        this.alchemyAutoRebalanceEnabled = false;
        this.alchemyOriginalAllocations = {}; // Store original player allocations for alchemy
        this.alchemyLastRebalanceCheck = 0;

        // Rebalance reasons storage
        this.rebalanceReasons = {};
        this.alchemyRebalanceReasons = {};

        this.filters = [{
            id: 'crafting',
            name: 'Crafting',
            tags: ['material'],
            isDefault: true,
        },{
            id: 'alchemy',
            name: 'Alchemy',
            tags: ['alchemy'],
            isDefault: false,
        }]

        this.eventHandler.registerHandler('query-crafting-general-data', (payload) => {
            this.sendGeneralData(payload.filterId)
        })

        this.eventHandler.registerHandler('query-crafting-data', (payload) => {
            this.sendCraftingData(payload);
        })

        this.eventHandler.registerHandler('query-crafting-details', (payload) => {
            this.sendCraftingDetails(payload.id)
        })

        this.eventHandler.registerHandler('set-crafting-level', (payload) => {
            this.setCraftingEffort(payload);
            this.normalizeTotalEffort(payload.filterId);
            this.updateActiveRecipes(payload.filterId);
            this.sendCraftingData(payload);
        })

        this.eventHandler.registerHandler('toggle-effort-lock', (payload) => {
            const { id, isLocked } = payload;
            console.log('toggle-effort-lock:', { id, isLocked, slot: this.craftingSlots[id] });
            if (this.craftingSlots[id]) {
                this.craftingSlots[id].isLocked = isLocked;
                console.log('Updated slot:', this.craftingSlots[id]);
                
                // Normalize efforts after locking/unlocking
                this.normalizeTotalEffort(this.craftingSlots[id].filterId);
                this.updateActiveRecipes(this.craftingSlots[id].filterId);
                
                this.sendCraftingData(payload);
            }
        })

        this.eventHandler.registerHandler('set-auto-rebalance', (payload) => {
            this.autoRebalanceEnabled = payload.enabled;
            
            // Clear original allocations and rebalance reasons when auto-rebalance is disabled
            if (!payload.enabled) {
                this.originalAllocations = {};
                this.rebalanceReasons = {};
            }
        })

        this.eventHandler.registerHandler('set-alchemy-auto-rebalance', (payload) => {
            this.alchemyAutoRebalanceEnabled = payload.enabled;
            
            // Clear original allocations and rebalance reasons when auto-rebalance is disabled
            if (!payload.enabled) {
                this.alchemyOriginalAllocations = {};
                this.alchemyRebalanceReasons = {};
            }
        })

        this.eventHandler.registerHandler('query-running-craft-for-list', (payload) => {
            const tagToCat = {
                'crafting': 'material',
                alchemy: 'alchemy'
            }
            const hypotheticValues = [];
            if(this.craftingSlots) {
                // Slots system is deprecated, using direct effort allocation instead
                for(const id in this.craftingSlots) {
                    const ent = gameEntity.getEntity(id);
                    const isIgnore = payload.category && !ent.tags.includes(tagToCat[payload.category]);
                    if(!isIgnore && this.craftingSlots[id]?.effort) {
                        hypotheticValues.push({
                            id,
                            name: ent.name,
                            effort: this.craftingSlots[id]?.effort
                        })
                    }
                }
            }

            this.eventHandler.sendData('running-craft-for-list', hypotheticValues);

        })
    }

    initialize() {


        registerCraftingRecipes()
    }

    tick(game, delta) {
        this.lists.tick(game, delta);
        
        // Auto-rebalancing check for crafting
        if (this.autoRebalanceEnabled) {
            this.lastRebalanceCheck += delta;
            if (this.lastRebalanceCheck >= this.rebalanceCheckInterval) {
                this.lastRebalanceCheck = 0;
                this.checkAndRebalance('crafting');
            }
        }
        
        // Auto-rebalancing check for alchemy
        if (this.alchemyAutoRebalanceEnabled) {
            this.alchemyLastRebalanceCheck += delta;
            if (this.alchemyLastRebalanceCheck >= this.rebalanceCheckInterval) {
                this.alchemyLastRebalanceCheck = 0;
                this.checkAndRebalance('alchemy');
            }
        }
    }

    save() {
        return {
            slots: this.craftingSlots,
            craftingLists: this.lists.save(),
            autoRebalanceEnabled: this.autoRebalanceEnabled,
            originalAllocations: this.originalAllocations,
            alchemyAutoRebalanceEnabled: this.alchemyAutoRebalanceEnabled,
            alchemyOriginalAllocations: this.alchemyOriginalAllocations,
            rebalanceReasons: this.rebalanceReasons,
            alchemyRebalanceReasons: this.alchemyRebalanceReasons,
            version: this.currentVersion
        }
    }

    load(obj) {
        if(this.craftingSlots) {
            for(const id in this.craftingSlots) {
                this.setCraftingEffort({ id, effort: 0, isForce: true });
            }
            this.craftingSlots = {};
        }

        // dont load deprecated crafting version
        if(!obj?.version || obj?.version < this.currentVersion) {
            return;
        }
        this.craftingSlots = obj?.slots || {};
        if(Array.isArray(this.craftingSlots)) {
            this.craftingSlots = {};
        }

        // Load auto-rebalancing data
        this.autoRebalanceEnabled = obj?.autoRebalanceEnabled ?? false;
        this.originalAllocations = obj?.originalAllocations || {};
        this.alchemyAutoRebalanceEnabled = obj?.alchemyAutoRebalanceEnabled ?? false;
        this.alchemyOriginalAllocations = obj?.alchemyOriginalAllocations || {};
        this.rebalanceReasons = obj?.rebalanceReasons || {};
        this.alchemyRebalanceReasons = obj?.alchemyRebalanceReasons || {};

        for(const id in this.craftingSlots) {
            this.setCraftingEffort({ id, effort: this.craftingSlots[id].effort, isForce: true });
        }

        // Safety check: normalize efforts if total exceeds 100% after loading
        this.validateAndNormalizeAllEfforts();

        // Update active recipes after normalization
        this.updateActiveRecipes('crafting');
        this.updateActiveRecipes('alchemy');

        if(obj?.craftingLists) {
            this.lists.load(obj.craftingLists);
        }
    }

    validateAndNormalizeAllEfforts() {
        // Check crafting category
        this.validateAndNormalizeCategoryEfforts('crafting');

        // Check alchemy category
        this.validateAndNormalizeCategoryEfforts('alchemy');
    }

    validateAndNormalizeCategoryEfforts(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };

        let totalEffort = 0;
        let lockedEffort = 0;
        const unlockedSlots = [];

        // Calculate total effort for this category
        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            if (!slot.effort || slot.effort <= 0) continue;

            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            totalEffort += slot.effort;

            if (slot.isLocked) {
                lockedEffort += slot.effort;
            } else {
                unlockedSlots.push({ recipeId, slot });
            }
        }

        // If total effort exceeds 100%, normalize
        if (totalEffort > 1.001) {
            console.warn(`Loaded ${category} efforts exceed 100%: ${(totalEffort * 100).toFixed(2)}%. Normalizing...`);
            console.log('Locked effort:', lockedEffort, 'Unlocked slots:', unlockedSlots.length);

            const availableEffort = Math.max(0, 1.0 - lockedEffort);
            const unlockedTotal = totalEffort - lockedEffort;

            if (unlockedTotal > 0 && availableEffort >= 0) {
                // Normalize only unlocked efforts to fit in available space
                for (const { recipeId, slot } of unlockedSlots) {
                    if (!this.craftingSlots[recipeId].isLocked) {
                        const proportion = slot.effort / unlockedTotal;
                        const normalizedEffort = availableEffort * proportion;
                        console.log(`Normalizing loaded ${recipeId}: ${slot.effort} -> ${normalizedEffort}`);
                        this.craftingSlots[recipeId].effort = normalizedEffort;
                    }
                }
            }

            // Additional safety check - ensure no locked recipe exceeds available space
            for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
                if (!slot.isLocked || !slot.effort || slot.effort <= 0) continue;

                const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
                if (!recipeTags.includes(tagToCat[category])) continue;

                const availableForLocked = this.getAvailableEffortForLockedRecipe(recipeId, category);
                if (slot.effort > availableForLocked) {
                    console.warn(`Loaded locked recipe ${recipeId} effort ${slot.effort} exceeds available space ${availableForLocked}. Limiting.`);
                    this.craftingSlots[recipeId].effort = availableForLocked;
                }
            }
        }
    }

    stopAllCrafting(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        }
        if(this.craftingSlots) {
            for(const id in this.craftingSlots) {
                const isIgnore = category && !gameEntity.getEntity(id).tags.includes(tagToCat[category]);
                if(!isIgnore) {
                    this.setCraftingEffort({ id, effort: 0, isForce: true, filterId: category });
                }
            }
        }
    }

    setCraftingEffort({ id, effort, isForce = false, filterId = null, isAutoRestore = false }) {
        if(!this.craftingSlots[id]) {
            this.craftingSlots[id] = {
                effort: 0,
                filterId,
                isLocked: false,
            }
        }
        if(effort < 0) {
            effort = 0;
        }

        // For locked recipes, limit effort to available space (100% - other locked efforts)
        const isLocked = this.craftingSlots[id].isLocked;
        if (isLocked && !isForce) {
            const availableEffort = this.getAvailableEffortForLockedRecipe(id, currentFilterId);
            if (effort > availableEffort) {
                console.log(`Limiting locked recipe ${id} effort from ${effort} to ${availableEffort} (max available: ${availableEffort})`);
                effort = availableEffort;
            }
        }

        if(effort > 1) {
            effort = 1;
        }

        if(id === 'craft_ruby') {
            console.log('New Ruby Effort: ', effort);
        }

        this.craftingSlots[id].effort = effort;

        const catToTag = tags => {
            if(tags.includes('material')) return 'crafting';
            if(tags.includes('alchemy')) return 'alchemy';
            throw new Error('Invalid crafting')
        }

        if(!this.craftingSlots[id].filterId) {
            this.craftingSlots[id].filterId = catToTag(gameEntity.getEntity(id).tags);
        }

        // Use filterId from parameter if provided, otherwise from slot
        const currentFilterId = filterId || this.craftingSlots[id].filterId;

        if(!isForce) {
            this.recalculateRemaining(id, currentFilterId, 1 - effort)
        }

        // Safety check: ensure total effort doesn't exceed 100%
        this.normalizeTotalEffort(currentFilterId);

        const allocations = currentFilterId === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
        const isEmpty = effort === 0; // Recipe should be inactive if effort is 0, regardless of allocations

        // If this is not auto-restore and not force, check if we should remove from originalAllocations
        if (!isAutoRestore && !isForce && allocations[id] !== undefined) {
            const originalEffort = allocations[id];
            // If user manually changed effort (not auto-restore), remove from originalAllocations
            if (Math.abs(effort - originalEffort) > 0.01) {
                delete allocations[id];
                const rebalanceReasons = currentFilterId === 'crafting' ? this.rebalanceReasons : this.alchemyRebalanceReasons;
                if (rebalanceReasons[id]) {
                    delete rebalanceReasons[id];
                }
            }
        }

        if(isEmpty && gameEntity.entityExists(`activeCrafting_${id}`)) {
            console.log(`Deactivating recipe ${id} due to zero effort`);
            gameEntity.unsetEntity(`activeCrafting_${id}`)
        }
        if(!isEmpty) {
            if(!gameEntity.entityExists(`activeCrafting_${id}`)) {
                gameEntity.registerGameEntity(`activeCrafting_${id}`, {
                    copyFromId: id,
                    level: 1,
                    allowedImpacts: ['resources'],
                    tags: ['running', 'runningCrafting'],
                    unlockedBy: undefined,
                })
            }
        }

        if(id === 'craft_ruby') {
            console.log('BAPP: ', this.craftingSlots['craft_ruby'].effort);
        }

        this.applyCraftingIntensities();

        if(id === 'craft_ruby') {
            console.log('AAPP: ', this.craftingSlots['craft_ruby'].effort);
        }

    }

    recalculateRemaining(skipId, category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        }

        const skippedEffort = this.craftingSlots[skipId]?.effort ?? 0;
        
        // Calculate total locked effort (excluding the skipped recipe)
        const lockedEffort = Object.entries(this.craftingSlots).reduce((acc, [key, recipe]) => {
            if (key !== skipId && recipe.isLocked && gameEntity.getEntity(key).tags.includes(tagToCat[category])) {
                return acc + recipe.effort;
            }
            return acc;
        }, 0);
        
        const remainingToRedistribute = 1 - skippedEffort - lockedEffort;
        const currentRecipes = Object.entries(this.craftingSlots).filter(([key, one]) => gameEntity.getEntity(key).tags.includes(tagToCat[category]));
        const currentEffortsTotal = currentRecipes.reduce((acc, [key, recipe]) => {
            // Only count unlocked recipes (excluding the skipped one)
            if (key !== skipId && !recipe.isLocked) {
                return acc + recipe.effort;
            }
            return acc;
        }, 0);
        const mult = currentEffortsTotal ? remainingToRedistribute/currentEffortsTotal : 1;
        console.log('recalculateRemaining: ', {
            skippedEffort, 
            lockedEffort, 
            remainingToRedistribute, 
            currentEffortsTotal, 
            mult
        });
        if(Math.abs(mult - 1) > SMALL_NUMBER && mult < 1) {
            if(this.craftingSlots) {
                for(const id in this.craftingSlots) {
                    const isIgnore = category && !gameEntity.getEntity(id).tags.includes(tagToCat[category]);
                    const isLocked = this.craftingSlots[id].isLocked;
                    if(!isIgnore && skipId !== id && !isLocked) {
                        console.log(`recalculateRemaining: changing ${id} effort from ${this.craftingSlots[id].effort} to ${this.craftingSlots[id].effort * mult}`);
                        this.craftingSlots[id].effort *= mult;
                    } else if (isLocked) {
                        console.log(`recalculateRemaining: skipping LOCKED ${id} with effort ${this.craftingSlots[id].effort}`);
                    }
                }
            }
        }
        
        // Update active recipes after recalculating efforts
        this.updateActiveRecipes(category);
        
        // Send updated data to UI
        this.sendCraftingData({ filterId: category });
    }

    applyCraftingIntensities() {

        const resourceModifier = {
            get_income: () => {

                const intensities = {}
                for(const key in this.craftingSlots) {
                    intensities[`effort_${key}`] = {
                        A: 0,
                        B: this.craftingSlots[key].effort,
                        type: 0,
                    }
                }

                return {
                    effects: intensities,
                }
            },
            effectDeps: ['crafting_effort', 'alchemy_effort']
        }
        if(gameEntity.entityExists('crafting_intensities')) {
            gameEntity.unsetEntity('crafting_intensities');
        }
        gameEntity.registerGameEntity('crafting_intensities', {
            name: 'Crafting Intensities',
            level: 1,
            resourceModifier,
        })

        gameEntity.setEntityLevel('crafting_intensities', 1, true);
    }

    normalizeTotalEffort(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };

        // Calculate total effort and locked effort for this category
        let totalEffort = 0;
        let lockedEffort = 0;
        const unlockedSlots = [];
        
        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            if (!slot.effort || slot.effort <= 0) continue;
            
            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;
            
            totalEffort += slot.effort;
            
            if (slot.isLocked) {
                console.log(`Recipe ${recipeId} is LOCKED with effort ${slot.effort}`);
                lockedEffort += slot.effort;
            } else {
                console.log(`Recipe ${recipeId} is UNLOCKED with effort ${slot.effort}`);
                unlockedSlots.push({ recipeId, slot });
            }
        }

        // If total effort exceeds 100%, normalize only unlocked efforts
        if (totalEffort > 1.001) { // Small tolerance for floating point errors
            console.warn(`Total effort for ${category} exceeded 100%: ${(totalEffort * 100).toFixed(2)}%. Normalizing unlocked efforts...`);
            console.log('Locked effort:', lockedEffort, 'Unlocked slots:', unlockedSlots.length);
            
            const availableEffort = Math.max(0, 1.0 - lockedEffort);
            const unlockedTotal = totalEffort - lockedEffort;
            
            if (unlockedTotal > 0 && availableEffort >= 0) {
                // Normalize only unlocked efforts to fit in available space
                for (const { recipeId, slot } of unlockedSlots) {
                    // Double check that this slot is not locked before changing it
                    if (!this.craftingSlots[recipeId].isLocked) {
                        const proportion = slot.effort / unlockedTotal;
                        const normalizedEffort = availableEffort * proportion;
                        console.log(`Normalizing ${recipeId}: ${slot.effort} -> ${normalizedEffort}`);
                        this.craftingSlots[recipeId].effort = normalizedEffort;
                    } else {
                        console.log(`Skipping locked recipe ${recipeId} with effort ${slot.effort}`);
                    }
                }
            }
        }
    }

    getAvailableEffortForLockedRecipe(recipeId, category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };

        // Calculate total locked effort from all OTHER locked recipes in this category
        let totalLockedEffort = 0;
        for (const [id, slot] of Object.entries(this.craftingSlots)) {
            if (id === recipeId || !slot.effort || slot.effort <= 0) continue;

            const recipeTags = gameEntity.getEntity(id)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            if (slot.isLocked) {
                totalLockedEffort += slot.effort;
            }
        }

        // Available effort is 100% minus other locked efforts
        const availableEffort = Math.max(0, 1.0 - totalLockedEffort);
        console.log(`Available effort for locked recipe ${recipeId}: ${availableEffort} (total locked: ${totalLockedEffort})`);

        return availableEffort;
    }

    updateActiveRecipes(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };

        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;
            
            const hasEffort = slot.effort > 0;
            const isActive = gameEntity.entityExists(`activeCrafting_${recipeId}`);
            
            if (!hasEffort && isActive) {
                console.log(`Deactivating recipe ${recipeId} due to zero effort after rebalancing`);
                gameEntity.unsetEntity(`activeCrafting_${recipeId}`);
            } else if (hasEffort && !isActive) {
                console.log(`Activating recipe ${recipeId} with effort ${slot.effort}`);
                gameEntity.registerGameEntity(`activeCrafting_${recipeId}`, {
                    copyFromId: recipeId,
                    level: 1,
                    allowedImpacts: ['resources'],
                    tags: ['running', 'runningCrafting'],
                    unlockedBy: undefined,
                });
            }
        }
    }

    // Auto-rebalancing methods
    checkAndRebalance(category) {
        const isEnabled = category === 'crafting' ? this.autoRebalanceEnabled : this.alchemyAutoRebalanceEnabled;
        if (!isEnabled) return;
        
        // Try to restore individual recipes that can be restored
        this.tryRestoreIndividualRecipes(category);

        // Check for recipes that need rebalancing
        this.rebalanceInefficientRecipes(category);

        this.normalizeTotalEffort(category);
        this.updateActiveRecipes(category);
        
        // Send updated data to UI
        this.sendCraftingData({ filterId: category });
    }

    tryRestoreIndividualRecipes(category) {
        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
        const rebalanceReasons = category === 'crafting' ? this.rebalanceReasons : this.alchemyRebalanceReasons;
        
        for (const [recipeId, originalEffort] of Object.entries(allocations)) {
            if (!this.craftingSlots[recipeId]) continue;
            
            const currentEffort = this.craftingSlots[recipeId]?.effort || 0;
            
            // If current effort is already close to original, skip
            if (Math.abs(currentEffort - originalEffort) < 0.01) continue;

            // dont restore in case its profitable
            if(currentEffort > originalEffort) continue;
            
            // Check if we can run this specific recipe at original effort level for at least 3 seconds
            if (this.canRunRecipeAtEffortForDuration(recipeId, originalEffort, 3)) {
                // Restore this specific recipe
                this.setCraftingEffort({
                    id: recipeId,
                    effort: originalEffort,
                    isForce: false,
                    filterId: category,
                    isAutoRestore: true
                });

                // Don't remove from allocations for auto-restored recipes
                // (Auto-restored recipes should remain in allocations for future restoration)
                // They will be removed only when user manually changes the effort
            }
        }
    }

    canRestoreOriginalAllocations(category) {
        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
        
        for (const [recipeId, originalEffort] of Object.entries(allocations)) {
            if (!this.craftingSlots[recipeId]) continue;

            // console.log('check: ', recipeId, gameEntity.entityExists(`activeCrafting_${recipeId}`));
            
            if (!gameEntity.entityExists(`activeCrafting_${recipeId}`)) continue;
            
            const currentEntity = gameEntity.getEntity(`activeCrafting_${recipeId}`);
            if (!currentEntity) continue;
            
            const currentEffort = this.craftingSlots[recipeId]?.effort || 0;
            
            // If current effort is already close to original, don't restore
            if (Math.abs(currentEffort - originalEffort) < 0.01) continue;
            
            // Check if we can run this recipe at original effort level for at least 3 seconds
            if (!this.canRunRecipeAtEffortForDuration(recipeId, originalEffort, 3)) {
                return false;
            }
        }
        return Object.keys(allocations).length > 0;
    }

    canRunRecipeAtEffortForDuration(recipeId, effort, durationSeconds) {
        // Get the recipe entity
        const recipeEntity = gameEntity.getEntity(recipeId);
        if (!recipeEntity) return false;
        
        // Get effects at original effort level
        const effects = gameEntity.getEffects(recipeId, 0, 1, true, 1, 1, effort);
         
        // Filter for consumption effects that are resources
        const consumptionEffects = effects.filter(effect => 
            effect.scope === 'consumption' && 
            effect.type === 'resources'
        );
        
        // Check each consumption effect
        for (const effect of consumptionEffects) {
            const resourceId = effect.id;
            const resource = gameResources.getResource(resourceId);
            if (!resource) continue;

            // Calculate consumption per second at test effort
            const consumptionPerSecond = Math.abs(effect.value || 0);
            if (consumptionPerSecond <= 0) continue;

            // Calculate how much we need for the duration
            const requiredForDuration = consumptionPerSecond * durationSeconds;

            // Check if we have enough resource considering the consumption effect
            // We need to check if: current_balance - consumption_per_second >= 0
            // This ensures the resource won't go negative when this recipe runs
            const projectedBalance = resource.balance - consumptionPerSecond;

            if (resource.amount < requiredForDuration || projectedBalance < 0) {
                return false;
            }
        }
        
        return true;
    }

    restoreOriginalAllocations(category) {
        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
        
        for (const [recipeId, originalEffort] of Object.entries(allocations)) {
            if (this.craftingSlots[recipeId]) {
                this.setCraftingEffort({
                    id: recipeId,
                    effort: originalEffort,
                    isForce: true,
                    filterId: category
                });
            }
        }
        
        // Clear allocations and rebalance reasons for this category
        if (category === 'crafting') {
            this.originalAllocations = {};
            this.rebalanceReasons = {};
        } else {
            this.alchemyOriginalAllocations = {};
            this.alchemyRebalanceReasons = {};
        }
    }

    rebalanceInefficientRecipes(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };

        let totalUnusedEffort = 0;
        const recipesToRebalance = [];

        // Check each recipe for inefficiency (only for the specific category)
        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            if (!slot.effort || slot.effort <= 0) continue;

            if (!gameEntity.entityExists(`activeCrafting_${recipeId}`)) continue;

            const currentEntity = gameEntity.getEntity(`activeCrafting_${recipeId}`);
            if (!currentEntity) continue;

            // Only process recipes for the specific category
            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            const efficiency = currentEntity.modifier?.efficiency ?? 1;
            
            if (efficiency < 0.98) { // Recipe is running inefficiently
                const unusedEffort = slot.effort * (1 - efficiency);
                totalUnusedEffort += unusedEffort;
                
                // Get the bottleneck resource that caused this inefficiency
                const bottleNeck = currentEntity.modifier?.bottleNeck ? gameResources.getResource(currentEntity.modifier.bottleNeck) : null;
                const missingResourceName = bottleNeck?.name || 'resources';
                
                recipesToRebalance.push({ 
                    recipeId, 
                    unusedEffort, 
                    efficiency, 
                    missingResourceName 
                });
            }
        }

        console.log('RBeffB: ', JSON.parse(JSON.stringify(this.craftingSlots)), recipesToRebalance, totalUnusedEffort);

        if (totalUnusedEffort > 0.01) { // Only rebalance if there's significant unused effort
            this.redistributeUnusedEffort(recipesToRebalance, totalUnusedEffort, category);
        }

        console.log('RBeffA: ', JSON.parse(JSON.stringify(this.craftingSlots)), totalUnusedEffort);

    }

    getPotentialAllocateTargets(category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };
        
        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
        const potentialTargets = [];
        
        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            if (!slot.effort || slot.effort <= 0) continue;

            if (!gameEntity.entityExists(`activeCrafting_${recipeId}`)) continue;

            // Only process recipes for the specific category
            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            const currentEntity = gameEntity.getEntity(`activeCrafting_${recipeId}`);
            if (!currentEntity) continue;

            const efficiency = currentEntity.modifier?.efficiency ?? 1;
            
            // Check if this recipe was rebalanced down (current effort < original effort)
            const originalEffort = allocations[recipeId];
            const wasRebalancedDown = originalEffort !== undefined && slot.effort < originalEffort;
            
            // Only add recipes that are running efficiently (no bottlenecks) AND were not rebalanced down
            if (efficiency > 0.98 && !wasRebalancedDown) {
                potentialTargets.push({ recipeId, currentEffort: slot.effort });
            }
        }
        
        return potentialTargets;
    }

    redistributeUnusedEffort(recipesToRebalance, totalUnusedEffort, category) {
        const tagToCat = {
            'crafting': 'material',
            alchemy: 'alchemy'
        };
        
        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;

        // Store original allocations if not already stored
        if (Object.keys(allocations).length === 0) {
            for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
                if (slot.effort > 0) {
                    const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
                    if (recipeTags.includes(tagToCat[category])) {
                        allocations[recipeId] = slot.effort;
                    }
                }
            }
        }

        // First, reduce effort on inefficient recipes
        for (const { recipeId, unusedEffort, missingResourceName } of recipesToRebalance) {
            const currentEffort = this.craftingSlots[recipeId]?.effort || 0;
            const newEffort = Math.max(0, currentEffort - unusedEffort);
            
            // Store the reason for rebalancing this recipe
            const rebalanceReasons = category === 'crafting' ? this.rebalanceReasons : this.alchemyRebalanceReasons;
            rebalanceReasons[recipeId] = missingResourceName;
            
            this.setCraftingEffort({
                id: recipeId,
                effort: newEffort,
                isForce: true,
                filterId: category
            });
        }

        // Get potential targets that can accept more effort (no bottlenecks)
        const availableRecipes = this.getPotentialAllocateTargets(category);

        
        // Filter out recipes that were just rebalanced
        const filteredAvailableRecipes = availableRecipes.filter(recipe => 
            !recipesToRebalance.some(r => r.recipeId === recipe.recipeId)
        );

        if (filteredAvailableRecipes.length === 0) return;

        // Calculate total effort of available recipes for proportional distribution
        const totalAvailableEffort = filteredAvailableRecipes.reduce((sum, recipe) => sum + recipe.currentEffort, 0);

        // Redistribute unused effort proportionally to available recipes
        for (const availableRecipe of filteredAvailableRecipes) {
            const proportion = availableRecipe.currentEffort / totalAvailableEffort;
            const additionalEffort = totalUnusedEffort * proportion;
            
            const newEffort = availableRecipe.currentEffort + additionalEffort;
            this.setCraftingEffort({
                id: availableRecipe.recipeId,
                effort: newEffort,
                isForce: true,
                filterId: category
            });
        }

        // Safety check after redistribution
        this.normalizeTotalEffort(category);
        this.updateActiveRecipes(category);

        // Recalculate optimal allocations after redistribution to account for new possibilities
        this.recalculateOptimalAllocations(category);

        // Check for cascading effects - if we increased some recipes, their dependents might now be able to run more
        this.checkForCascadingEffects(category);

        // Send updated data to UI
        this.sendCraftingData({ filterId: category });
    }

    /**
     * Check for cascading effects after redistribution
     * If we increased production of some recipes, their dependents might now be able to run more efficiently
     */
    checkForCascadingEffects(category) {
        const tagToCat = {
            'crafting': 'material',
            'alchemy': 'alchemy'
        };

        // Find recipes that were increased compared to their original allocations
        const increasedRecipes = [];
        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            const originalEffort = (category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations)[recipeId];
            if (originalEffort && (slot.effort || 0) > originalEffort + 0.01) {
                increasedRecipes.push({
                    recipeId,
                    originalEffort,
                    currentEffort: slot.effort || 0,
                    effortIncrease: (slot.effort || 0) - originalEffort
                });
            }
        }

        if (increasedRecipes.length === 0) return;

        console.log(`Checking cascading effects for increased recipes:`, increasedRecipes.map(r => r.recipeId));

        // For each increased recipe, check if dependent recipes can now run more
        for (const increasedRecipe of increasedRecipes) {
            this.checkDependentRecipes(category, increasedRecipe);
        }

        // After cascading changes, normalize efforts
        this.normalizeTotalEffort(category);
        this.updateActiveRecipes(category);

        // Update optimal allocations to reflect cascading changes
        this.recalculateOptimalAllocations(category);
    }

    /**
     * Check if dependent recipes can be increased when a producer recipe is increased
     */
    checkDependentRecipes(category, increasedRecipe) {
        const producerEntity = gameEntity.getEntity(increasedRecipe.recipeId);
        if (!producerEntity) return;

        // Get what this recipe produces (with current effort)
        const currentEffort = this.craftingSlots[increasedRecipe.recipeId]?.effort || 0;
        const productionEffects = gameEntity.getEffects(increasedRecipe.recipeId, 0, 1, true, 1, 1, currentEffort);

        const resourceProductions = productionEffects.filter(effect =>
            effect.scope === 'resources' && effect.value > 0
        );

        if (resourceProductions.length === 0) return;

        console.log(`Recipe ${increasedRecipe.recipeId} produces:`, resourceProductions.map(e => `${e.id}: ${e.value}`));

        // Find recipes that consume these resources
        for (const production of resourceProductions) {
            const resourceId = production.id;

            // Check all active recipes to see if they consume this resource
            for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
                if (!slot.effort || slot.effort <= 0) continue;
                if (recipeId === increasedRecipe.recipeId) continue; // Don't check the producer itself

                const consumerEntity = gameEntity.getEntity(recipeId);
                if (!consumerEntity) continue;

                // Check if this recipe consumes the produced resource
                const consumerEffects = gameEntity.getEffects(recipeId, 0, 1, true, 1, 1, slot.effort);
                const consumptionEffects = consumerEffects.filter(effect =>
                    effect.scope === 'consumption' && effect.type === 'resources' && effect.id === resourceId
                );

                if (consumptionEffects.length > 0) {
                    console.log(`Recipe ${recipeId} consumes ${resourceId} - checking if it can be increased`);

                    // Try to increase this consumer recipe
                    const currentEffort = slot.effort || 0;
                    const maxIncrease = 0.1; // Try 10% increase
                    const testEffort = Math.min(currentEffort + maxIncrease, 1.0);

                    if (this.canRunRecipeAtEffortForDuration(recipeId, testEffort, 3)) {
                        console.log(`Can increase ${recipeId} from ${currentEffort} to ${testEffort}`);

                        this.setCraftingEffort({
                            id: recipeId,
                            effort: testEffort,
                            isForce: true,
                            filterId: category
                        });

                        // Recursively check if this increase enables other recipes
                        this.checkDependentRecipes(category, {
                            recipeId,
                            originalEffort: currentEffort,
                            currentEffort: testEffort,
                            effortIncrease: testEffort - currentEffort
                        });
                    }
                }
            }
        }
    }

    /**
     * Recalculates optimal effort allocations after redistribution
     * This accounts for new production possibilities that may have opened up
     */
    recalculateOptimalAllocations(category) {
        const tagToCat = {
            'crafting': 'material',
            'alchemy': 'alchemy'
        };

        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
        const rebalanceReasons = category === 'crafting' ? this.rebalanceReasons : this.alchemyRebalanceReasons;

        // Find recipes that are currently running efficiently
        const efficientRecipes = [];
        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            if (!slot.effort || slot.effort <= 0) continue;

            if (!gameEntity.entityExists(`activeCrafting_${recipeId}`)) continue;

            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            const currentEntity = gameEntity.getEntity(`activeCrafting_${recipeId}`);
            if (!currentEntity) continue;

            const efficiency = currentEntity.modifier?.efficiency ?? 1;

            // Only consider recipes running at high efficiency
            if (efficiency > 0.95) {
                efficientRecipes.push({
                    recipeId,
                    currentEffort: slot.effort,
                    efficiency,
                    entity: currentEntity
                });
            }
        }

        if (efficientRecipes.length === 0) return;

        // Try to optimize each efficient recipe
        const newAllocations = {};
        let totalEffort = 0;

        for (const recipe of efficientRecipes) {
            // Calculate optimal effort for this recipe
            const optimalEffort = this.calculateOptimalEffortForRecipe(recipe, category);

            // Check if increasing this recipe's effort would benefit the overall system
            if (optimalEffort > recipe.currentEffort) {
                const effortIncrease = optimalEffort - recipe.currentEffort;

                // Check if we have space for this increase
                const availableSpace = 1.0 - totalEffort;
                const actualIncrease = Math.min(effortIncrease, availableSpace);

                if (actualIncrease > 0.01) { // Only if meaningful increase
                    newAllocations[recipe.recipeId] = recipe.currentEffort + actualIncrease;
                    totalEffort += recipe.currentEffort + actualIncrease;

                    // Check if this increase would enable other recipes to run more efficiently
                    this.checkForEnabledRecipes(category, recipe, actualIncrease);
                } else {
                    newAllocations[recipe.recipeId] = recipe.currentEffort;
                    totalEffort += recipe.currentEffort;
                }
            } else {
                newAllocations[recipe.recipeId] = recipe.currentEffort;
                totalEffort += recipe.currentEffort;
            }
        }

        // If we found better allocations, update them
        if (Object.keys(newAllocations).length > 0) {
            // Merge with existing allocations for recipes we didn't analyze
            for (const [recipeId, effort] of Object.entries(allocations)) {
                if (!newAllocations[recipeId]) {
                    const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
                    if (recipeTags.includes(tagToCat[category])) {
                        newAllocations[recipeId] = effort;
                    }
                }
            }

            // Update allocations
            Object.assign(allocations, newAllocations);

            console.log(`Recalculated optimal allocations for ${category}:`, newAllocations);
        }
    }

    /**
     * Calculate the optimal effort for a specific recipe
     */
    calculateOptimalEffortForRecipe(recipe, category) {
        const { recipeId, currentEffort, efficiency } = recipe;

        // If efficiency is already < 95%, don't try to increase
        if (efficiency < 0.95) return currentEffort;

        // Try to increase effort by up to 50% to see if it's beneficial
        const maxIncrease = currentEffort * 0.5;
        const testEffort = Math.min(currentEffort + maxIncrease, 1.0);

        // Check if this recipe can run at the increased effort for at least 3 seconds
        if (this.canRunRecipeAtEffortForDuration(recipeId, testEffort, 3)) {
            return testEffort;
        }

        return currentEffort;
    }

    /**
     * Check if increasing one recipe's effort enables other recipes to run more efficiently
     */
    checkForEnabledRecipes(category, increasedRecipe, effortIncrease) {
        const tagToCat = {
            'crafting': 'material',
            'alchemy': 'alchemy'
        };

        // This is where we would analyze production chains
        // For now, we'll implement a simple heuristic

        const increasedRecipeEntity = gameEntity.getEntity(increasedRecipe.recipeId);
        if (!increasedRecipeEntity) return;

        // Get what this recipe produces (with updated effort)
        const productionEffects = gameEntity.getEffects(increasedRecipe.recipeId, 0, 1, true, 1, 1, increasedRecipe.currentEffort + effortIncrease);

        // Look for production effects
        const resourceProductions = productionEffects.filter(effect =>
            effect.scope === 'resources' && effect.value > 0
        );

        if (resourceProductions.length > 0) {
            console.log(`Recipe ${increasedRecipe.recipeId} produces:`, resourceProductions.map(e => `${e.id}: ${e.value}`));
            // Here we could analyze which other recipes consume these resources
            // and potentially increase their optimal efforts
        }
    }

    regenerateNotifications() {

        this.filters.forEach(filter => {
            const entities = gameEntity.listEntitiesByTags(['recipe', ...filter.tags]);

            entities.forEach(item => {
                gameCore.getModule('unlock-notifications').registerNewNotification(
                    'workshop',
                    filter.id,
                    'all',
                    `crafting_${item.id}`,
                    item.isUnlocked && !item.isCapped
                )
            })
        })
    }

    getCraftingData(payload) {
        if(!payload?.filterId) {
            throw new Error(`FilterId is required`);
        }

        const filterId = payload?.filterId;

        const filter = this.filters.find(o => o.id === filterId);

        if(!filter) {
            throw new Error(`${filterId} not found`);
        }

        const entities = gameEntity.listEntitiesByTags(['recipe', ...filter.tags]).filter(one => one.isUnlocked);

        const efrs = filterId === 'crafting' ? gameEffects.getEffect('crafting_effort') : gameEffects.getEffect('alchemy_effort');

        const eff_key =  filterId === 'crafting' ? 'crafting_effort' : 'alchemy_effort';

        const available = entities.map(recipe => ({
            ...recipe,
            icon_id: recipe.resourceId,
            effort: this.craftingSlots[recipe.id]?.effort || 0,
            isLocked: this.craftingSlots[recipe.id]?.isLocked || false,
            resourceAmount: gameResources.getResource(recipe.resourceId)?.amount,
            resourceBalance: gameResources.getResource(recipe.resourceId)?.balance,
            breakDown: gameResources.getResource(recipe.resourceId)?.breakDown,
            isRunning: gameEntity.entityExists(`activeCrafting_${recipe.id}`) && this.craftingSlots[recipe.id]?.effort,
            isLowerEfficiency: gameEntity.entityExists(`activeCrafting_${recipe.id}`) && gameEntity.getEntity(`activeCrafting_${recipe.id}`).modifier?.efficiency < 1 - SMALL_NUMBER,
            isRebalanced: filterId === 'crafting' ? 
                         this.autoRebalanceEnabled && 
                         Object.keys(this.originalAllocations).length > 0 && 
                         this.originalAllocations[recipe.id] !== undefined && 
                         this.originalAllocations[recipe.id] !== this.craftingSlots[recipe.id]?.effort &&
                         gameEntity.entityExists(`activeCrafting_${recipe.id}`) :
                         filterId === 'alchemy' &&
                         this.alchemyAutoRebalanceEnabled &&
                         Object.keys(this.alchemyOriginalAllocations).length > 0 &&
                         this.alchemyOriginalAllocations[recipe.id] !== undefined &&
                         this.alchemyOriginalAllocations[recipe.id] !== this.craftingSlots[recipe.id]?.effort &&
                         gameEntity.entityExists(`activeCrafting_${recipe.id}`),
            isRebalancedBeneficial: filterId === 'crafting' ?
                                  this.autoRebalanceEnabled &&
                                  Object.keys(this.originalAllocations).length > 0 &&
                                  this.originalAllocations[recipe.id] !== undefined &&
                                  this.originalAllocations[recipe.id] < this.craftingSlots[recipe.id]?.effort :
                                  filterId === 'alchemy' &&
                                  this.alchemyAutoRebalanceEnabled &&
                                  Object.keys(this.alchemyOriginalAllocations).length > 0 &&
                                  this.alchemyOriginalAllocations[recipe.id] !== undefined &&
                                  this.alchemyOriginalAllocations[recipe.id] < this.craftingSlots[recipe.id]?.effort
        }));

        return {
            available,
            efforts: {
                ...efrs,
                usingRecipes: available.filter(one => one.effort > 0).map(({ id, name, effort }) => ({ id, name, effort })),
            },
            craftingLists: this.lists.getLists({ category: filterId }),
            autoRebalance: {
                enabled: filterId === 'crafting' ? this.autoRebalanceEnabled : this.alchemyAutoRebalanceEnabled,
                hasOriginalAllocations: filterId === 'crafting' ? 
                    Object.keys(this.originalAllocations).length > 0 : 
                    Object.keys(this.alchemyOriginalAllocations).length > 0,
                canRestore: filterId === 'crafting' ? 
                    this.canRestoreOriginalAllocations('crafting') : 
                    this.canRestoreOriginalAllocations('alchemy')
            }
        }
    }

    getCraftingDetails(id) {
        const entity = gameEntity.getEntity(id);

        const isRunning = gameEntity.entityExists(`activeCrafting_${id}`);

        let actualEntity = entity;

        let efficiency = 1;
        let bottleNeck = null;
        let rebalanceInfo = null;

        if(isRunning) {
            actualEntity = gameEntity.getEntity(`activeCrafting_${id}`);
            efficiency = actualEntity.modifier?.efficiency ?? 1;
            bottleNeck = actualEntity.modifier?.bottleNeck ? gameResources.getResource(actualEntity.modifier?.bottleNeck) : null;
        }

        const calculatedEffort = this.craftingSlots[entity.id]?.effort ? this.craftingSlots[entity.id]?.effort : 1;

        // Check if this recipe was rebalanced
        const currentEffort = this.craftingSlots[entity.id]?.effort || 0;
        const originalEffort = this.originalAllocations[entity.id] || this.alchemyOriginalAllocations[entity.id];
        
        if (originalEffort !== undefined && Math.abs(originalEffort - currentEffort) > 0.001) {
            const isBeneficial = currentEffort > originalEffort;
            const intensityReduction = ((originalEffort - currentEffort) / originalEffort * 100).toFixed(2);
            
            // Get the stored rebalance reason, or fall back to current bottleneck
            const rebalanceReasons = this.originalAllocations[entity.id] !== undefined ? this.rebalanceReasons : this.alchemyRebalanceReasons;
            const storedMissingResource = rebalanceReasons[entity.id];
            const missingResource = storedMissingResource || bottleNeck?.name || 'resources';
            
            rebalanceInfo = {
                isRebalanced: true,
                isBeneficial,
                originalEffort,
                currentEffort,
                intensityReduction: Math.abs(intensityReduction),
                missingResource
            };
        }

        return {
            ...entity,
            efficiency,
            bottleNeck,
            rebalanceInfo,
            effects: isRunning
                ? gameEntity.getEffects(`activeCrafting_${id}`, 0, this.craftingSlots[entity.id]?.level || 1, false, 1)
                : gameEntity.getEffects(entity.id, 0, 1, true, 1, 1,  calculatedEffort),
            affordable: gameEntity.getAffordable(entity.id),
            level: this.craftingSlots[entity.id]?.level || 0,
            maxLevel: 1
        }
    }

    sendCraftingData(payload) {
        const data = this.getCraftingData(payload);
        this.eventHandler.sendData(`crafting-data-${payload.filterId}`, data)
    }

    sendCraftingDetails(payload) {
        const data = this.getCraftingDetails(payload);
        this.eventHandler.sendData(`crafting-details`, data)
    }


    sendGeneralData(category_id) {
        const rs = category_id === 'crafting' ? 'crafting_ability' : 'alchemy_ability';
        let stats = {}
        if(category_id === 'crafting') {
            stats = {
                crafting_efficiency: {...gameEffects.getEffect('crafting_efficiency'), isMultiplier: true},
                crafting_materials_discount: {...gameEffects.getEffect('crafting_materials_discount'), isMultiplier: true},
            }
        }
        if(category_id === 'alchemy') {
            stats = {
                alchemy_efficiency: {...gameEffects.getEffect('alchemy_efficiency'), isMultiplier: true},
                alchemy_materials_discount: {...gameEffects.getEffect('alchemy_materials_discount'), isMultiplier: true},
            }
        }
        const data = {
            isProducingEffort: gameResources.getResource(rs).income > SMALL_NUMBER,
            stats
        }
        this.eventHandler.sendData('crafting-general-data', data);
    }

}