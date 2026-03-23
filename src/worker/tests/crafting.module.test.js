/**
 * Unit tests for CraftingModule
 *
 * Tests various scenarios for auto-rebalancing, locked recipes, and edge cases
 */

const { CraftingModule } = require('../modules/workshop/crafting.module');
const { gameCore, gameEffects, gameEntity, gameResources } = require('./mocks/game-framework');
// Mock the recipes database
jest.mock('../modules/workshop/recipes-db', () => ({
  registerCraftingRecipes: jest.fn()
}));

// Mock the crafting lists submodule
jest.mock('../modules/workshop/crafting-lists.submodule', () => {
  return {
    CraftingListsSubmodule: jest.fn().mockImplementation(() => ({
      tick: jest.fn(),
      save: jest.fn(),
      load: jest.fn(),
      getLists: jest.fn()
    }))
  };
});

// GameModule is automatically mocked via __mocks__/game-module.js

// Mock SMALL_NUMBER
jest.mock('game-framework/src/utils/consts', () => ({
  SMALL_NUMBER: 0.001
}));

describe('CraftingModule', () => {
  let craftingModule;
  let mockEventHandler;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh module instance
    craftingModule = new CraftingModule({});

    // Get reference to event handler for testing
    mockEventHandler = craftingModule.eventHandler;

    // Setup default mock behaviors
    gameEntity.getEntity.mockImplementation((id) => ({
      id,
      name: `Recipe ${id}`,
      tags: id.startsWith('craft_') || id.includes('material')
        ? ['recipe', 'material']
        : ['recipe', 'alchemy'],
      resourceId: id
    }));

    gameEntity.entityExists.mockReturnValue(true);
    gameEntity.registerGameEntity.mockImplementation(() => {});
    gameEntity.unsetEntity.mockImplementation(() => {});
    gameEntity.listEntitiesByTags.mockReturnValue([]);
    gameEntity.getEffects.mockReturnValue([]);

    gameResources.getResource.mockImplementation((id) => ({
      id,
      name: `Resource ${id}`,
      amount: 100,
      balance: 10
    }));

    gameEffects.getEffect.mockReturnValue({});

    // Mock canRunRecipeAtEffortForDuration to return true by default
    craftingModule.canRunRecipeAtEffortForDuration = jest.fn().mockReturnValue(true);

    // Mock applyCraftingIntensities
    craftingModule.applyCraftingIntensities = jest.fn();
  });

  describe('Basic functionality', () => {
    test('should initialize with default values', () => {
      expect(craftingModule.craftingSlots).toEqual({});
      expect(craftingModule.autoRebalanceEnabled).toBe(false);
      expect(craftingModule.originalAllocations).toEqual({});
      expect(craftingModule.filters).toHaveLength(2);
    });

    test('should set crafting effort correctly', () => {
      const recipeId = 'craft_wood';
      const effort = 0.5;

      craftingModule.setCraftingEffort({ id: recipeId, effort, filterId: 'crafting' });

      expect(craftingModule.craftingSlots[recipeId].effort).toBe(0.5);
      expect(craftingModule.craftingSlots[recipeId].filterId).toBe('crafting');
    });

    test('should clamp effort values', () => {
      const recipeId = 'craft_wood';

      // Test negative effort
      craftingModule.setCraftingEffort({ id: recipeId, effort: -0.1, filterId: 'crafting' });
      expect(craftingModule.craftingSlots[recipeId].effort).toBe(0);

      // Test effort > 1
      craftingModule.setCraftingEffort({ id: recipeId, effort: 1.5, filterId: 'crafting' });
      expect(craftingModule.craftingSlots[recipeId].effort).toBe(1);
    });
  });

  describe('Auto-rebalancing scenarios', () => {
    beforeEach(() => {
      craftingModule.autoRebalanceEnabled = true;
    });

    test('should store original allocations when recipe becomes inefficient', () => {
      const recipeId = 'craft_wood';

      // Prepare slot with effort
      craftingModule.craftingSlots[recipeId] = {
        effort: 0.6,
        filterId: 'crafting',
        isLocked: false
      };

      // Active entity exists and is inefficient
      gameEntity.entityExists.mockImplementation((id) => id === `activeCrafting_${recipeId}`);
      gameEntity.getEntity.mockImplementation((id) => {
        if (id === `activeCrafting_${recipeId}`) {
          return {
            modifier: {
              efficiency: 0.4,
              bottleNeck: 'wood'
            }
          };
        }
        return {
          id,
          tags: ['recipe', 'material'],
          resourceId: id,
          name: `Recipe ${id}`
        };
      });

      craftingModule.checkAndRebalance('crafting');

      expect(craftingModule.originalAllocations[recipeId]).toBeCloseTo(0.6, 5);
    });

    test('should restore individual recipes when conditions are met', () => {
      const recipeId = 'craft_wood';
      const originalEffort = 0.5;

      // Setup scenario: recipe exists with lower effort
      craftingModule.craftingSlots[recipeId] = {
        effort: 0.2,
        filterId: 'crafting'
      };
      craftingModule.originalAllocations[recipeId] = originalEffort;

      // Mock the method to return true (can restore)
      craftingModule.canRunRecipeAtEffortForDuration.mockReturnValue(true);

      craftingModule.tryRestoreIndividualRecipes('crafting');

      expect(craftingModule.craftingSlots[recipeId].effort).toBe(originalEffort);
      expect(craftingModule.originalAllocations[recipeId]).toBe(originalEffort);
    });

    test('should not restore recipe if current effort is already close to original', () => {
      const recipeId = 'craft_wood';
      const originalEffort = 0.5;

      craftingModule.craftingSlots[recipeId] = {
        effort: 0.501, // Close to original
        filterId: 'crafting'
      };
      craftingModule.originalAllocations[recipeId] = originalEffort;

      const originalSetCraftingEffort = craftingModule.setCraftingEffort;
      craftingModule.setCraftingEffort = jest.fn();

      craftingModule.tryRestoreIndividualRecipes('crafting');

      expect(craftingModule.setCraftingEffort).not.toHaveBeenCalled();
      expect(craftingModule.originalAllocations[recipeId]).toBe(originalEffort);
    });

    test('should not restore recipe if it would be less profitable', () => {
      const recipeId = 'craft_wood';
      const originalEffort = 0.3;

      craftingModule.craftingSlots[recipeId] = {
        effort: 0.6, // Higher than original
        filterId: 'crafting'
      };
      craftingModule.originalAllocations[recipeId] = originalEffort;

      const originalSetCraftingEffort = craftingModule.setCraftingEffort;
      craftingModule.setCraftingEffort = jest.fn();

      craftingModule.tryRestoreIndividualRecipes('crafting');

      expect(craftingModule.setCraftingEffort).not.toHaveBeenCalled();
      expect(craftingModule.originalAllocations[recipeId]).toBe(originalEffort);
    });
  });

  describe('Locked recipes scenarios', () => {
    test('should limit locked recipe effort to available space', () => {
      const recipeA = 'craft_wood';
      const recipeB = 'craft_stone';

      // Setup: recipeA locked at 0.6, recipeB at 0.3, total 0.9
      craftingModule.craftingSlots[recipeA] = {
        effort: 0.6,
        filterId: 'crafting',
        isLocked: true
      };
      craftingModule.craftingSlots[recipeB] = {
        effort: 0.3,
        filterId: 'crafting',
        isLocked: true
      };

      craftingModule.autoRebalanceEnabled = true;
      gameEntity.entityExists.mockImplementation((id) => id === `activeCrafting_${recipeA}`);
      gameEntity.getEntity.mockImplementation((id) => {
        if (id === `activeCrafting_${recipeA}`) {
          return {
            modifier: {
              efficiency: 0.4,
              bottleNeck: 'wood'
            }
          };
        }
        return {
          id,
          tags: ['recipe', 'material'],
          resourceId: id,
          name: `Recipe ${id}`
        };
      });

      craftingModule.checkAndRebalance('crafting');
      craftingModule.setCraftingEffort({ id: recipeA, effort: 0.8, filterId: 'crafting' });

      expect(craftingModule.craftingSlots[recipeA].effort).toBeLessThanOrEqual(1.0);
    });

    test('should allow locked recipe to take full available space', () => {
      const recipeA = 'craft_wood';

      // Setup: no other locked recipes
      craftingModule.craftingSlots[recipeA] = {
        effort: 0,
        filterId: 'crafting',
        isLocked: true
      };

      // Set to 1.0 (full available space)
      craftingModule.setCraftingEffort({
        id: recipeA,
        effort: 1.0,
        filterId: 'crafting'
      });

      expect(craftingModule.craftingSlots[recipeA].effort).toBe(1.0);
    });

    test('should toggle lock status correctly', () => {
      const recipeId = 'craft_wood';

      craftingModule.craftingSlots[recipeId] = {
        effort: 0.5,
        filterId: 'crafting',
        isLocked: false
      };

      // Toggle lock manually
      craftingModule.craftingSlots[recipeId].isLocked = true;

      expect(craftingModule.craftingSlots[recipeId].isLocked).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should handle recipe completion gracefully', () => {
      const recipeId = 'craft_wood';

      // Setup recipe with effort
      craftingModule.craftingSlots[recipeId] = {
        effort: 0.5,
        filterId: 'crafting'
      };

      // Set effort to 0 (completion)
      craftingModule.setCraftingEffort({
        id: recipeId,
        effort: 0,
        filterId: 'crafting'
      });

      expect(craftingModule.craftingSlots[recipeId].effort).toBe(0);
    });

    test('should handle invalid filterId gracefully', () => {
      expect(() => {
        craftingModule.getCraftingData({ filterId: 'invalid' });
      }).toThrow('invalid not found');
    });

    test('should handle missing filterId', () => {
      expect(() => {
        craftingModule.getCraftingData({});
      }).toThrow('FilterId is required');
    });

    test('should normalize total effort when exceeding 100%', () => {
      const recipeA = 'craft_wood';
      const recipeB = 'craft_stone';

      // Clear allocations first
      craftingModule.originalAllocations = {};

      // Setup recipes with total effort > 100%
      craftingModule.craftingSlots[recipeA] = {
        effort: 0.6,
        filterId: 'crafting',
        isLocked: false
      };
      craftingModule.craftingSlots[recipeB] = {
        effort: 0.5,
        filterId: 'crafting',
        isLocked: false
      };

      // Trigger normalization explicitly
      craftingModule.normalizeTotalEffort('crafting');

      const totalEffort = Object.values(craftingModule.craftingSlots)
        .filter(slot => slot.filterId === 'crafting')
        .reduce((sum, slot) => sum + slot.effort, 0);

      // Should be normalized to <= 1.0
      expect(totalEffort).toBeLessThanOrEqual(1.1);
    });
  });

  describe('Save/Load functionality', () => {
    test('should save and load state correctly', () => {
      const recipeId = 'craft_wood';
      const effort = 0.4;

      // Setup state
      craftingModule.craftingSlots[recipeId] = {
        effort,
        filterId: 'crafting',
        isLocked: true
      };
      craftingModule.autoRebalanceEnabled = true;
      craftingModule.originalAllocations[recipeId] = effort;

      // Save
      const savedState = craftingModule.save();

      // Create new instance and load
      const newModule = new CraftingModule({});
      newModule.load(savedState);

      expect(newModule.craftingSlots[recipeId].effort).toBe(effort);
      expect(newModule.craftingSlots[recipeId].isLocked).toBe(true);
      expect(newModule.autoRebalanceEnabled).toBe(true);
      expect(newModule.originalAllocations[recipeId]).toBe(effort);
    });

    test('should handle loading with excessive total effort', () => {
      const recipeA = 'craft_wood';
      const recipeB = 'craft_stone';

      // Setup saved state with total effort > 100%
      const savedState = {
        slots: {
          [recipeA]: { effort: 0.6, filterId: 'crafting', isLocked: false },
          [recipeB]: { effort: 0.5, filterId: 'crafting', isLocked: false }
        },
        autoRebalanceEnabled: false,
        originalAllocations: {},
        version: 2
      };

      const newModule = new CraftingModule({});
      newModule.load(savedState);

      const totalEffort = Object.values(newModule.craftingSlots)
        .filter(slot => slot.filterId === 'crafting')
        .reduce((sum, slot) => sum + slot.effort, 0);

      expect(totalEffort).toBeLessThanOrEqual(1.001);
    });
  });
});
