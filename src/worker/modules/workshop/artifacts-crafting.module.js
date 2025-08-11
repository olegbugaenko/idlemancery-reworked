import {GameModule} from "../../shared/game-module";
import {gameCore, gameEffects, gameEntity, gameResources, resourceCalculators} from "game-framework";

export class ArtifactsCraftingModule extends GameModule {

    constructor(props) {
        super(props);

        this.currentVersion = 1;

        // 3 slots for materials
        this.slots = [null, null, null]; // slotIndex -> materialId or null
        
        // List of unlocked artifact recipes
        this.unlockedRecipes = [];

        this.eventHandler.registerHandler('query-artifacts-crafting-slots', () => {
            this.sendSlotsStatus();
        });

        this.eventHandler.registerHandler('query-artifacts-crafting-materials', () => {
            this.sendArtifactMaterials();
        });

        this.eventHandler.registerHandler('place-material', (payload) => {
            this.placeMaterial(payload.slotIndex, payload.materialId);
        });

        this.eventHandler.registerHandler('remove-material', (payload) => {
            this.removeMaterial(payload.slotIndex);
        });

        this.eventHandler.registerHandler('check-recipe', () => {
            this.checkRecipe();
        });

        this.eventHandler.registerHandler('query-unlocked-recipes', () => {
            this.sendUnlockedRecipes();
        });

        this.eventHandler.registerHandler('clear-slots', () => {
            this.clearSlots();
        });

        this.eventHandler.registerHandler('confirm-unlock', (payload) => {
            this.confirmUnlock(payload.artifactId);
        });
    }

    initialize() {
        // Initialize slots
        this.slots = [null, null, null];
        this.unlockedRecipes = [];
    }

    tick() {

    }

    save() {
        return {
            slots: this.slots,
            unlockedRecipes: this.unlockedRecipes,
            version: this.currentVersion
        }
    }

    load(obj) {
        if (!obj?.version || obj.version < this.currentVersion) {
            return;
        }
        
        this.slots = obj.slots || [null, null, null];
        this.unlockedRecipes = obj.unlockedRecipes || [];
    }

    getSlotsStatus() {
        const matchingArtifact = this.getMatchingArtifact();
        
        return this.slots.map((materialId, index) => ({
            slotIndex: index,
            materialId: materialId,
            isEmpty: materialId === null,
            material: materialId ? gameResources.getResource(materialId) : null,
            highlighting: this.getSlotHighlighting(materialId, index),
            matchingArtifact: matchingArtifact
        }));
    }

    getMatchingArtifact() {
        // Only check if all slots are filled
        if (!this.slots.every(slot => slot !== null)) {
            return null;
        }

        console.log('Current slots:', this.slots);

        // Get all artifacts from property system
        const artifacts = gameEntity.listEntitiesByTags(['artifact']);

        console.log('Checking recipes: ', artifacts, this.unlockedRecipes);
        
        for (const artifact of artifacts) {
            // Skip if already unlocked
            if (this.unlockedRecipes.includes(artifact.id)) continue;
            
            // Get ingredients from artifact
            const ingredients = this.getArtifactIngredients(artifact);
            
            console.log(`Checking artifact ${artifact.name}:`, ingredients);
            if (!ingredients) continue;
            // Check if current slots match the recipe
            if (this.matchesRecipe(ingredients)) {
                console.log(`Match found for ${artifact.name}!`);
                return {
                    id: artifact.id,
                    name: artifact.name
                };
            }
        }
        
        return null;
    }

    getSlotHighlighting(materialId, slotIndex) {
        // If slot is empty, no highlighting
        if (!materialId) {
            return 'none';
        }

        // Get current filled materials (including this one)
        const currentMaterials = this.slots.filter(slot => slot !== null);
        
        // Get all artifacts from property system
        const artifacts = gameEntity.listEntitiesByTags(['artifact']);
        
        // Check if current combination of materials could be part of any undiscovered recipe
        for (const artifact of artifacts) {
            // Skip if already unlocked
            if (this.unlockedRecipes.includes(artifact.id)) continue;
            
            // Get ingredients from artifact
            const ingredients = this.getArtifactIngredients(artifact);
            if (!ingredients) continue;
            
            // Check if ALL current materials are part of this recipe
            const allCurrentMaterialsInRecipe = currentMaterials.every(material => 
                ingredients.includes(material)
            );
            
            if (allCurrentMaterialsInRecipe) {
                return 'green'; // Current combination could be part of this recipe
            }
        }
        
        return 'red'; // Current combination doesn't match any recipe
    }

    getArtifactMaterials() {
        // Get all resources with "artifact-material" tag
        const materials = gameResources.listResourcesByTags(['artifact-material']);
        
        return materials.filter(one => one.amount).map(material => ({
            id: material.id,
            name: material.name,
            description: material.description,
            tags: material.tags,
            icon: material.icon || material.id
        }));
    }

    placeMaterial(slotIndex, materialId) {
        if (slotIndex < 0 || slotIndex >= 3) return;
        
        // Check if material has artifact-material tag
        const material = gameResources.getResource(materialId);
        if (!material || !material.tags.includes('artifact-material')) {
            return;
        }

        this.slots[slotIndex] = materialId;
        this.sendSlotsStatus();
        
        // Auto-check recipe when all slots are filled
        if (this.slots.every(slot => slot !== null)) {
            this.checkRecipe();
        }
    }

    removeMaterial(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 3) return;
        
        this.slots[slotIndex] = null;
        this.sendSlotsStatus();
    }

    checkRecipe() {
        // Get all artifacts from property system
        const artifacts = gameEntity.listEntitiesByTags(['artifact']);
        
        for (const artifact of artifacts) {
            // Skip if already unlocked
            if (this.unlockedRecipes.includes(artifact.id)) continue;
            
            // Get ingredients from artifact
            const ingredients = this.getArtifactIngredients(artifact);
            if (!ingredients) continue;
            
            // Check if current slots match the recipe
            if (this.matchesRecipe(ingredients)) {
                // Don't unlock yet, just notify UI that recipe was found
                this.eventHandler.sendData('recipe-found', {
                    success: true,
                    recipe: {
                        artifactId: artifact.id,
                        artifactName: artifact.name
                    }
                });
                
                // Update slots status (but don't clear)
                this.sendSlotsStatus();
                
                return {
                    success: true,
                    artifactId: artifact.id,
                    artifactName: artifact.name
                };
            }
        }
        
        // Send failure message to UI
        this.eventHandler.sendData('recipe-found', {
            success: false
        });
        
        return { success: false };
    }

    confirmUnlock(artifactId) {
        // Actually unlock the recipe
        this.unlockRecipe(artifactId);
        this.sendUnlockedRecipes();
    }

    getArtifactIngredients(artifact) {
        // Try to get ingredients from different sources
        if (artifact.attributes?.ingredients) {
            return artifact.attributes.ingredients;
        }
        
        if (artifact.get_cost) {
            const cost = artifact.get_cost();
            if (Array.isArray(cost)) {
                return cost;
            }
        }
        
        if (artifact.cost && Array.isArray(artifact.cost)) {
            return artifact.cost;
        }
        
        return null;
    }

    matchesRecipe(requiredIngredients) {
        if (!requiredIngredients || requiredIngredients.length !== 3) return false;
        
        // Create a copy of slots to check against
        const currentSlots = [...this.slots];
        
        // Check if all required ingredients are present in slots
        for (const requiredIngredient of requiredIngredients) {
            const foundIndex = currentSlots.findIndex(slot => slot === requiredIngredient);
            if (foundIndex === -1) return false;
            
            // Mark this slot as used
            currentSlots[foundIndex] = null;
        }
        
        // Check if all slots were used (no extra materials)
        return currentSlots.every(slot => slot === null);
    }

    unlockRecipe(artifactId) {
        if (!this.unlockedRecipes.includes(artifactId)) {
            this.unlockedRecipes.push(artifactId);
        }
    }

    getUnlockedRecipes() {
        return this.unlockedRecipes.map(artifactId => {
            const artifact = gameEntity.getEntity(artifactId);
            return {
                id: artifactId,
                name: artifact?.name || artifactId,
                description: artifact?.description || '',
                tags: artifact?.tags || []
            };
        });
    }

    isRecipeUnlocked(artifactId) {
        return this.unlockedRecipes.includes(artifactId);
    }

    // Helper method to get recipe hint (for slot highlighting)
    getRecipeHint() {
        // This could return hints about which materials might work together
        // For now, return basic info about current slots
        return {
            slots: this.slots,
            totalMaterials: this.slots.filter(slot => slot !== null).length,
            isComplete: this.slots.every(slot => slot !== null)
        };
    }

    // Send data to UI
    sendSlotsStatus() {
        const status = this.getSlotsStatus();
        this.eventHandler.sendData('artifacts-crafting-slots', status);
    }

    sendArtifactMaterials() {
        const materials = this.getArtifactMaterials();
        console.log('Materials: ', materials);
        this.eventHandler.sendData('artifacts-crafting-materials', materials);
    }

    sendUnlockedRecipes() {
        const recipes = this.getUnlockedRecipes();
        this.eventHandler.sendData('unlocked-recipes', recipes);
    }

    clearSlots() {
        this.slots = [null, null, null];
        this.sendSlotsStatus();
    }
} 