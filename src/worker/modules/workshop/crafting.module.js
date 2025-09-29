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
                console.log('this.originalEffort', JSON.parse(JSON.stringify(this.originalAllocations)), JSON.parse(JSON.stringify(this.rebalanceReasons)));
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
        // Also update originalEffort to normalized values to prevent bugs
        this.validateAndNormalizeAllEfforts(true);

        // Update active recipes after normalization
        this.updateActiveRecipes('crafting');
        this.updateActiveRecipes('alchemy');

        if(obj?.craftingLists) {
            this.lists.load(obj.craftingLists);
        }
    }

    validateAndNormalizeAllEfforts(updateOriginals = false) {
        // Check crafting category
        this.validateAndNormalizeCategoryEfforts('crafting', updateOriginals);

        // Check alchemy category
        this.validateAndNormalizeCategoryEfforts('alchemy', updateOriginals);
    }

    validateAndNormalizeCategoryEfforts(category, updateOriginals = false) {
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
        }

        // Normalize originalEffort if requested (e.g., after loading)
        // This ensures originalEffort sum equals 1.0, preventing future rebalance issues
        if (updateOriginals) {
            const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
            
            // Calculate total originalEffort for this category
            let totalOriginalEffort = 0;
            const categoryOriginals = [];
            
            for (const [recipeId, originalEffort] of Object.entries(allocations)) {
                const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
                if (recipeTags.includes(tagToCat[category])) {
                    totalOriginalEffort += originalEffort;
                    categoryOriginals.push({ recipeId, originalEffort });
                }
            }
            
            // Normalize originalEfforts to sum to 1.0
            if (totalOriginalEffort > 1.001) {
                console.log(`Normalizing originalEfforts for ${category}: total ${totalOriginalEffort} -> 1.0`);
                
                for (const { recipeId, originalEffort } of categoryOriginals) {
                    const normalizedOriginal = originalEffort / totalOriginalEffort;
                    console.log(`Normalizing originalEffort for ${recipeId}: ${originalEffort} -> ${normalizedOriginal}`);
                    allocations[recipeId] = normalizedOriginal;
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
            
            // Update originalEffort for all recipes affected by recalculateRemaining
            if (!isAutoRestore) {
                this.updateOriginalAllocationsAfterRecalculate(currentFilterId);
            }
        }

        // Safety check: ensure total effort doesn't exceed 100%
        // Update originalEffort if this is a user action (not auto-restore or force)
        this.normalizeTotalEffort(currentFilterId, !isAutoRestore && !isForce);

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

    /**
     * Update originalAllocations to match current efforts after recalculateRemaining
     * This ensures originalEffort reflects the actual redistributed efforts
     */
    updateOriginalAllocationsAfterRecalculate(category) {
        const tagToCat = {
            'crafting': 'material',
            'alchemy': 'alchemy'
        };

        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;

        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            const recipeTags = gameEntity.getEntity(recipeId)?.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            // Update originalEffort to current effort if it was previously stored
            if (allocations[recipeId] !== undefined && !slot.isLocked) {
                const currentEffort = slot.effort || 0;
                if (currentEffort > 0) {
                    console.log(`Updating originalEffort after recalculate for ${recipeId}: ${allocations[recipeId]} -> ${currentEffort}`);
                    allocations[recipeId] = currentEffort;
                }
            }
        }
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

    normalizeTotalEffort(category, updateOriginals = false) {
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
                // console.log(`Recipe ${recipeId} is LOCKED with effort ${slot.effort}`);
                lockedEffort += slot.effort;
            } else {
                // console.log(`Recipe ${recipeId} is UNLOCKED with effort ${slot.effort}`);
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

        // If requested, renormalize original allocations so their sum <= 1 (category-scoped)
        if (updateOriginals) {
            const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;
            let sum = 0;
            for (const [rid, val] of Object.entries(allocations)) {
                const tags = gameEntity.getEntity(rid)?.tags || [];
                if (tags.includes(tagToCat[category])) {
                    sum += (val || 0);
                }
            }
            if (sum > 1 + 1e-9) {
                const k = 1 / sum;
                for (const [rid, val] of Object.entries(allocations)) {
                    const tags = gameEntity.getEntity(rid)?.tags || [];
                    if (tags.includes(tagToCat[category])) {
                        allocations[rid] = (val || 0) * k;
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

        const state = this.collectCategoryAutoRebalanceState(category);
        if (!state.recipes.length) {
            return;
        }

        const rebalanceReasons = category === 'crafting' ? this.rebalanceReasons : this.alchemyRebalanceReasons;

        const flowContext = this.buildResourceFlowContext(state.recipes);

        const adjustments = new Map();
        const queueAdjustment = (recipe, newEffort) => {
            const clamped = Math.max(0, Math.min(1, newEffort));
            adjustments.set(recipe.id, clamped);
            recipe.currentEffort = clamped;
        };

        let freedEffort = 0;
        let hasShortage = false;
        const reduced = new Set();

        for (const recipe of state.recipes) {
            if (recipe.isLocked || recipe.currentEffort <= SMALL_NUMBER) continue;

            if (recipe.efficiency < 0.99 - SMALL_NUMBER) {
                hasShortage = true;

                const targetEffort = this.calculateEffortForEfficiency(recipe, 0.99, flowContext);
                const clampedTarget = Math.min(recipe.currentEffort, targetEffort);

                if (clampedTarget < recipe.currentEffort - SMALL_NUMBER) {
                    const freed = recipe.currentEffort - clampedTarget;
                    freedEffort += freed;
                    queueAdjustment(recipe, clampedTarget);
                    reduced.add(recipe.id);

                    const bottleneckName = recipe.bottleNeck ? gameResources.getResource(recipe.bottleNeck)?.name : null;
                    rebalanceReasons[recipe.id] = bottleneckName || 'resources';
                }
            }
        }

        // Distribute freed effort plus any free pool up to 100%
        {
            const totalUsedEffort = state.recipes.reduce((sum, r) => sum + (r.currentEffort || 0), 0);
            let toDistribute = freedEffort + Math.max(0, 1 - totalUsedEffort);
            if (toDistribute > SMALL_NUMBER) {
                // Build recipient list: not locked, efficient, not just reduced
                const recipients = [];
                for (const r of state.recipes) {
                    if (r.isLocked) continue;
                    if (reduced.has(r.id)) continue;
                    if ((r.efficiency ?? 1) < 0.99 - SMALL_NUMBER) continue;
                    // sustainable headroom
                    const s = this.findSustainableEffort(r, 1, flowContext);
                    const headroom = Math.max(0, s - (r.currentEffort || 0));
                    if (headroom <= SMALL_NUMBER) continue;
                    const weight = (r.originalEffort ?? r.currentEffort ?? 0);
                    if (weight <= SMALL_NUMBER) continue;
                    recipients.push({ r, weight, headroom });
                }

                const totalWeight = recipients.reduce((sum, x) => sum + x.weight, 0);
                if (totalWeight > SMALL_NUMBER) {
                    for (const { r, weight, headroom } of recipients) {
                        if (toDistribute <= SMALL_NUMBER) break;
                        const share = toDistribute * (weight / totalWeight);
                        const give = Math.min(share, headroom);
                        if (give > SMALL_NUMBER) {
                            queueAdjustment(r, (r.currentEffort || 0) + give);
                            toDistribute -= give;
                        }
                    }
                }
                // consumed freedEffort implicitly
                freedEffort = 0;
            }
        }

        const borrowEffort = (amount, excludeId = null) => {
            let remaining = amount;
            let taken = 0;

            // First, use any already freed effort
            if (freedEffort > SMALL_NUMBER) {
                const used = Math.min(freedEffort, remaining);
                freedEffort -= used;
                remaining -= used;
                taken += used;
            }

            // Second, use available free effort from the total pool
            if (remaining > SMALL_NUMBER) {
                const totalUsedEffort = state.recipes.reduce((sum, r) => sum + r.currentEffort, 0);
                const availableFreeEffort = Math.max(0, 1.0 - totalUsedEffort);
                
                if (availableFreeEffort > SMALL_NUMBER) {
                    const usedFree = Math.min(availableFreeEffort, remaining);
                    remaining -= usedFree;
                    taken += usedFree;
                }
            }

            let guard = 0;
            while (remaining > SMALL_NUMBER && guard < 5) {
                guard += 1;

                const donors = state.recipes.filter((recipe) => {
                    if (recipe.isLocked) return false;
                    if (excludeId && recipe.id === excludeId) return false;
                    const baseline = recipe.originalEffort ?? recipe.baseEffort ?? 0;
                    return recipe.currentEffort - baseline > SMALL_NUMBER;
                });

                console.log('donors: ', donors);

                if (!donors.length) {
                    break;
                }

                const totalExtra = donors.reduce((sum, recipe) => {
                    const baseline = recipe.originalEffort ?? recipe.baseEffort ?? 0;
                    return sum + Math.max(0, recipe.currentEffort - baseline);
                }, 0);

                if (totalExtra <= SMALL_NUMBER) {
                    break;
                }

                for (const donor of donors) {
                    const baseline = donor.originalEffort ?? donor.baseEffort ?? 0;
                    const extra = Math.max(0, donor.currentEffort - baseline);
                    if (extra <= SMALL_NUMBER) continue;

                    const portion = Math.min(extra, (extra / totalExtra) * remaining);
                    if (portion <= SMALL_NUMBER) continue;

                    queueAdjustment(donor, donor.currentEffort - portion);
                    remaining -= portion;
                    taken += portion;

                    if (remaining <= SMALL_NUMBER) {
                        break;
                    }
                }
            }

            return taken;
        };

        for (const recipe of state.recipes) {
            if (recipe.isLocked) continue;
            if (recipe.originalEffort === undefined) continue;
            if (recipe.currentEffort >= recipe.originalEffort - SMALL_NUMBER) continue;
            if (recipe.efficiency < 0.999) continue;

            const sustainable = this.findSustainableEffort(recipe, recipe.originalEffort, flowContext);
            console.log(`Sustainable for ${recipe.id} is`, sustainable, recipe.originalEffort, flowContext);
            if (sustainable <= recipe.currentEffort + SMALL_NUMBER) {
                continue;
            }

            const target = Math.min(recipe.originalEffort, sustainable);
            if (target <= recipe.currentEffort + SMALL_NUMBER) {
                continue;
            }

            const needed = target - recipe.currentEffort;
            const obtained = borrowEffort(needed, recipe.id);

            console.log(`target for ${recipe.id} is`, target, needed, obtained);
            if (obtained > SMALL_NUMBER) {
                queueAdjustment(recipe, recipe.currentEffort + obtained);

                if (recipe.currentEffort >= recipe.originalEffort - SMALL_NUMBER) {
                    delete rebalanceReasons[recipe.id];
                }
            }
        }

        if (!hasShortage) {
            for (const recipe of state.recipes) {
                if (!rebalanceReasons[recipe.id]) continue;

                if (recipe.originalEffort === undefined) {
                    delete rebalanceReasons[recipe.id];
                    continue;
                }

                if (recipe.currentEffort >= recipe.originalEffort - SMALL_NUMBER && recipe.efficiency >= 0.99) {
                    delete rebalanceReasons[recipe.id];
                }
            }
        }

        for (const [recipeId, effort] of adjustments.entries()) {
            this.setCraftingEffort({
                id: recipeId,
                effort,
                isForce: true,
                filterId: category,
                isAutoRestore: true,
            });
        }

        this.normalizeTotalEffort(category);
        this.updateActiveRecipes(category);
        this.sendCraftingData({ filterId: category });
    }

    collectCategoryAutoRebalanceState(category) {
        const tagToCat = {
            'crafting': 'material',
            'alchemy': 'alchemy'
        };

        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;

        const recipes = [];

        for (const [recipeId, slot] of Object.entries(this.craftingSlots)) {
            const recipeEntity = gameEntity.getEntity(recipeId);
            if (!recipeEntity) continue;

            const recipeTags = recipeEntity.tags || [];
            if (!recipeTags.includes(tagToCat[category])) continue;

            const currentEffort = slot.effort || 0;
            const hasStoredOriginal = allocations[recipeId] !== undefined;

            if (!hasStoredOriginal && currentEffort > 0) {
                allocations[recipeId] = currentEffort;
            }

            const originalEffort = allocations[recipeId];
            const baseEffort = originalEffort !== undefined ? originalEffort : currentEffort;

            const isActive = gameEntity.entityExists(`activeCrafting_${recipeId}`);
            const activeEntity = isActive ? gameEntity.getEntity(`activeCrafting_${recipeId}`) : null;
            const efficiency = activeEntity?.modifier?.efficiency ?? 1;
            const bottleNeck = activeEntity?.modifier?.bottleNeck ?? null;

            const recipeState = {
                id: recipeId,
                slot,
                currentEffort,
                originalEffort,
                baseEffort,
                efficiency,
                bottleNeck,
                isLocked: !!slot.isLocked,
            };

            recipes.push(recipeState);
        }

        return { recipes, allocations };
    }

    canRestoreOriginalAllocations(category) {
        const allocations = category === 'crafting' ? this.originalAllocations : this.alchemyOriginalAllocations;

        if (!Object.keys(allocations).length) {
            return false;
        }

        const state = this.collectCategoryAutoRebalanceState(category);
        if (!state.recipes.length) {
            return false;
        }

        const flowContext = this.buildResourceFlowContext(state.recipes);

        for (const [recipeId, originalEffort] of Object.entries(allocations)) {
            const recipe = state.recipes.find((entry) => entry.id === recipeId);
            if (!recipe) {
                continue;
            }

            if (originalEffort <= SMALL_NUMBER) {
                continue;
            }

            const sustainable = this.findSustainableEffort(recipe, originalEffort, flowContext);
            if (sustainable + SMALL_NUMBER < originalEffort) {
                return false;
            }
        }

        return true;
    }

    buildResourceFlowContext(recipes) {
        const resourceMap = new Map();
        const recipeEffects = new Map();
        const resourceIds = new Set();

        for (const recipe of recipes) {
            const effects = this.getRecipeResourceEffects(recipe.id);
            // console.log(`Got effects for ${recipe.id}`, effects);
            recipeEffects.set(recipe.id, effects);

            for (const [resourceId, amount] of effects.consumption.entries()) {
                let entry = resourceMap.get(resourceId);
                if (!entry) {
                    entry = { producers: [], consumers: [] };
                    resourceMap.set(resourceId, entry);
                }

                entry.consumers.push({
                    recipeId: recipe.id,
                    recipeRef: recipe,
                    consumptionPerEffort: amount,
                });

                resourceIds.add(resourceId);
            }

            for (const [resourceId, amount] of effects.production.entries()) {
                let entry = resourceMap.get(resourceId);
                if (!entry) {
                    entry = { producers: [], consumers: [] };
                    resourceMap.set(resourceId, entry);
                }

                entry.producers.push({
                    recipeId: recipe.id,
                    recipeRef: recipe,
                    productionPerEffort: amount,
                });

                resourceIds.add(resourceId);
            }
        }

        const baseBalances = new Map();
        for (const resourceId of resourceIds) {
            const resourceState = resourceCalculators.assertResource(resourceId, false, ['runningCrafting']);
            baseBalances.set(resourceId, resourceState?.balance ?? 0);
        }

        return { resourceMap, recipeEffects, baseBalances };
    }

    getRecipeResourceEffects(recipeId) {
        const effects = gameEntity.getEffects(recipeId, 0, 1, true, 1, 1, 1);
        const consumption = new Map();
        const production = new Map();

        for (const effect of effects) {
            if (effect.type !== 'resources') continue;

            const resourceId = effect.id;
            if (!resourceId) continue;

            const multiplier = gameResources.getResource(resourceId)?.multiplier ?? 1;
            const value = (effect.value || 0) * multiplier;
            const amount = Math.abs(value);

            if (amount <= SMALL_NUMBER) continue;

            if (effect.scope === 'consumption') {
                const existing = consumption.get(resourceId) ?? 0;
                consumption.set(resourceId, existing + amount);
            } else if (effect.scope === 'income') {
                const existing = production.get(resourceId) ?? 0;
                production.set(resourceId, (existing + amount)*gameResources.getResource(resourceId).multiplier);
            }
        }

        return { consumption, production };
    }

    calculateEffortForEfficiency(recipe, targetEfficiency, flowContext) {
        const { currentEffort } = recipe;
        if (currentEffort <= SMALL_NUMBER) {
            return 0;
        }

        const hasOriginal = typeof recipe.originalEffort === 'number';
        const referenceEffort = hasOriginal ? recipe.originalEffort : currentEffort;
        const upperBound = Math.max(SMALL_NUMBER, Math.min(referenceEffort, 1));

        const sustainableEffort = this.findSustainableEffort(recipe, upperBound, flowContext);
        if (sustainableEffort <= SMALL_NUMBER) {
            return 0;
        }

        const bufferedEffort = sustainableEffort * targetEfficiency;
        return Math.max(0, Math.min(currentEffort, bufferedEffort));
    }

    findSustainableEffort(recipe, upperBound, flowContext) {
        if (upperBound <= SMALL_NUMBER) {
            return 0;
        }

        let low = 0;
        let high = Math.min(upperBound, 1);
        let best = 0;

        for (let i = 0; i < 12; i += 1) {
            const mid = (low + high) / 2;

            if (mid <= SMALL_NUMBER) {
                break;
            }

            if (this.canRunWithPositiveBalance(recipe, mid, upperBound, flowContext)) {
                best = mid;
                low = mid;
            } else {
                high = mid;
            }

            if (high - low <= 0.0005) {
                break;
            }
        }

        return best;
    }

    canRunWithPositiveBalance(recipe, effort, upperBound, flowContext) {
        const { resourceMap, recipeEffects, baseBalances } = flowContext;
        const recipeEffect = recipeEffects.get(recipe.id);
        if (!recipeEffect) {
            return true;
        }

        let remainingFreed = Math.max(0, upperBound - effort);

        for (const [resourceId, consumptionPerEffort] of recipeEffect.consumption.entries()) {
            const entry = resourceMap.get(resourceId);
            const baseBalance = baseBalances.get(resourceId) ?? 0;
            let netBalance = baseBalance;

            if (entry) {
                for (const consumer of entry.consumers) {
                    const expectedEffort = consumer.recipeId === recipe.id
                        ? effort
                        : (consumer.recipeRef.currentEffort || 0);
                    netBalance -= consumer.consumptionPerEffort * expectedEffort;
                }

                for (const producer of entry.producers) {
                    const expectedEffort = producer.recipeId === recipe.id
                        ? effort
                        : (producer.recipeRef.currentEffort || 0);
                    netBalance += producer.productionPerEffort * expectedEffort;
                    // console.log(`Expected effort for ${producer.recipeId} is ${expectedEffort}`);
                }

                // console.log('Producers And Consumers of '+recipe.id + `(${resourceId})`, entry, netBalance);
                if (netBalance < -SMALL_NUMBER && remainingFreed > SMALL_NUMBER) {
                    const potentialProducers = entry.producers.filter((producer) => {
                        if (producer.recipeId === recipe.id) return false;
                        if (producer.recipeRef.isLocked) return false;
                        if ((producer.recipeRef.currentEffort || 0) <= SMALL_NUMBER) return false;
                        return producer.recipeRef.efficiency >= 0.99 - SMALL_NUMBER;
                    });

                    if (potentialProducers.length) {
                        const bestRate = potentialProducers.reduce((max, producer) => Math.max(max, producer.productionPerEffort), 0);

                        if (bestRate > SMALL_NUMBER) {
                            const neededEffort = Math.min(remainingFreed, Math.max(0, (-netBalance) / bestRate));
                            netBalance += neededEffort * bestRate;
                            remainingFreed -= neededEffort;
                        }
                    }
                }
            } else {
                netBalance -= consumptionPerEffort * effort;
            }

            if (netBalance < -SMALL_NUMBER) {
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

    /**
     * Recalculates optimal effort allocations after redistribution
     * This accounts for new production possibilities that may have opened up
     */
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