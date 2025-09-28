/**
 * Comprehensive tests for auto-rebalancing functionality
 *
 * Tests specific scenarios mentioned by the user:
 * - Basic auto-rebalancing with dependent recipes
 * - Recipe completion and restoration
 * - Locked recipes behavior
 */

const { CraftingModule } = require('../modules/workshop/crafting.module');
const { gameCore, gameEffects, gameEntity, gameResources } = require('./mocks/game-framework');

// Mock dependencies
jest.mock('../modules/workshop/recipes-db', () => ({
  registerCraftingRecipes: jest.fn()
}));

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

jest.mock('game-framework/src/utils/consts', () => ({
  SMALL_NUMBER: 0.001
}));

describe('Auto-Rebalancing Scenarios', () => {
  let craftingModule;
  let mockEventHandler;

  let resourceState;
  let activeEfficiencies;
  let bottlenecks;

  beforeEach(() => {
    jest.clearAllMocks();
    craftingModule = new CraftingModule({});
    mockEventHandler = craftingModule.eventHandler;

    resourceState = {};
    activeEfficiencies = {};
    bottlenecks = {};

    const recipeEntities = {
      craft_refined_wood: {
        id: 'craft_refined_wood',
        name: 'Craft Refined Wood',
        tags: ['recipe', 'material'],
        resourceId: 'refined_wood'
      },
      craft_wooden_beam: {
        id: 'craft_wooden_beam',
        name: 'Craft Wooden Beam',
        tags: ['recipe', 'material'],
        resourceId: 'wooden_beam'
      },
      craft_paper: {
        id: 'craft_paper',
        name: 'Craft Paper',
        tags: ['recipe', 'material'],
        resourceId: 'paper'
      },
      craft_wood: {
        id: 'craft_wood',
        name: 'Craft Wood',
        tags: ['recipe', 'material'],
        resourceId: 'wood'
      },
      craft_mental_potion: {
        id: 'craft_mental_potion',
        name: 'Craft Mental Potion',
        tags: ['recipe', 'alchemy'],
        resourceId: 'mental_potion'
      }
    };

    const effectsMap = {
      craft_refined_wood: [
        { scope: 'consumption', type: 'resources', id: 'wood', value: -3 }
      ],
      craft_wooden_beam: [
        { scope: 'consumption', type: 'resources', id: 'refined_wood', value: -2 }
      ],
      craft_wood: [
        { scope: 'consumption', type: 'resources', id: 'log', value: -4 }
      ],
      craft_mental_potion: [
        { scope: 'consumption', type: 'resources', id: 'alchemy_essence', value: -1 }
      ]
    };

    gameEntity.getEntity.mockImplementation((id) => {
      if (id.startsWith('activeCrafting_')) {
        const baseId = id.replace('activeCrafting_', '');
        return {
          modifier: {
            efficiency: activeEfficiencies[baseId] ?? 1,
            bottleNeck: bottlenecks[baseId] ?? null
          }
        };
      }
      return recipeEntities[id] || {
        id,
        name: `Recipe ${id}`,
        tags: ['recipe', 'material'],
        resourceId: id
      };
    });

    gameEntity.entityExists.mockImplementation((id) =>
      id.startsWith('activeCrafting_') || Boolean(recipeEntities[id])
    );
    gameEntity.registerGameEntity.mockImplementation(() => {});
    gameEntity.unsetEntity.mockImplementation(() => {});
    gameEntity.listEntitiesByTags.mockReturnValue([]);

    gameEntity.getEffects.mockImplementation((id) => effectsMap[id] || []);

    gameResources.getResource.mockImplementation((id) => {
      const state = resourceState[id];
      return {
        id,
        name: `Resource ${id}`,
        amount: state?.amount ?? 100,
        balance: state?.balance ?? 10
      };
    });

    const realCanRun = craftingModule.canRunRecipeAtEffortForDuration.bind(craftingModule);
    craftingModule.canRunRecipeAtEffortForDuration = jest.fn((...args) => realCanRun(...args));
    craftingModule.applyCraftingIntensities = jest.fn();
  });

  describe('Dependent Recipe Scenario', () => {
    test('should handle dependent recipe completion and restoration', () => {
      craftingModule.autoRebalanceEnabled = true;

      const originalEfforts = {
        craft_refined_wood: 0.6,
        craft_wooden_beam: 0.4
      };

      craftingModule.craftingSlots['craft_refined_wood'] = { effort: originalEfforts.craft_refined_wood, filterId: 'crafting' };
      craftingModule.craftingSlots['craft_wooden_beam'] = { effort: originalEfforts.craft_wooden_beam, filterId: 'crafting' };

      gameEntity.getEntity.mockImplementation((id) => {
        if (id.startsWith('activeCrafting_')) {
          const baseId = id.replace('activeCrafting_', '');
          return {
            modifier: {
              efficiency: activeEfficiencies[baseId] ?? 1,
              bottleNeck: bottlenecks[baseId] ?? null
            }
          };
        }
        return recipeEntities[id] || {
          id,
          name: `Recipe ${id}`,
          tags: ['recipe', 'material'],
          resourceId: id
        };
      });

      resourceState = {
        wood: { amount: 0, balance: -10 }
      };

      craftingModule.checkAndRebalance('crafting');

      const beamEffortAfterShortage = craftingModule.craftingSlots['craft_wooden_beam'].effort;
      expect(beamEffortAfterShortage).toBeLessThan(originalEfforts.craft_wooden_beam);

      gameEntity.getEntity.mockImplementation((id) => {
        if (id.startsWith('activeCrafting_')) {
          return { modifier: { efficiency: 1, bottleNeck: null } };
        }
        if (id === 'craft_refined_wood') {
          return {
            id,
            name: 'Craft Refined Wood',
            tags: ['recipe', 'material'],
            resourceId: 'refined_wood'
          };
        }
        if (id === 'craft_wooden_beam') {
          return {
            id,
            name: 'Craft Wooden Beam',
            tags: ['recipe', 'material'],
            resourceId: 'wooden_beam'
          };
        }
        return {
          id,
          name: `Recipe ${id}`,
          tags: ['recipe', 'material'],
          resourceId: id
        };
      });

      resourceState = {};

      craftingModule.checkAndRebalance('crafting');

      expect(craftingModule.craftingSlots['craft_wooden_beam'].effort).toBeGreaterThanOrEqual(originalEfforts.craft_wooden_beam);
    });

    test('should maintain original allocations for auto-restored recipes', () => {
      const recipeId = 'craft_wooden_beam';
      const originalEffort = 0.4;

      craftingModule.craftingSlots[recipeId] = {
        effort: 0.2, // Reduced due to inefficiency
        filterId: 'crafting'
      };
      craftingModule.originalAllocations[recipeId] = originalEffort;

      craftingModule.autoRebalanceEnabled = true;
      craftingModule.canRunRecipeAtEffortForDuration.mockReturnValue(true);

      // Run restoration
      craftingModule.tryRestoreIndividualRecipes('crafting');

      // Recipe should be restored
      expect(craftingModule.craftingSlots[recipeId].effort).toBe(originalEffort);

      // Original allocation should remain (not cleared for auto-restored recipes)
      expect(craftingModule.originalAllocations[recipeId]).toBe(originalEffort);
    });

    test('should not restore recipe if resources are insufficient', () => {
      const recipeId = 'craft_wooden_beam';
      const originalEffort = 0.4;

      craftingModule.craftingSlots[recipeId] = {
        effort: 0.1,
        filterId: 'crafting'
      };
      craftingModule.originalAllocations[recipeId] = originalEffort;

      // Mock insufficient resources
      craftingModule.canRunRecipeAtEffortForDuration.mockReturnValue(false);

      craftingModule.tryRestoreIndividualRecipes('crafting');

      // Recipe should not be restored
      expect(craftingModule.craftingSlots[recipeId].effort).toBe(0.1);
      // Original allocation should remain
      expect(craftingModule.originalAllocations[recipeId]).toBe(originalEffort);
    });
  });

  describe('Locked Recipes Integration', () => {
    test('should respect locked recipes when rebalancing', () => {
      // Setup: wooden beam locked at 0.5, refined wood at 0.3, paper at 0.2
      craftingModule.setCraftingEffort({ id: 'craft_wooden_beam', effort: 0.5, filterId: 'crafting' });
      craftingModule.setCraftingEffort({ id: 'craft_refined_wood', effort: 0.3, filterId: 'crafting' });
      craftingModule.setCraftingEffort({ id: 'craft_paper', effort: 0.2, filterId: 'crafting' });

      // Lock wooden beam
      craftingModule.craftingSlots['craft_wooden_beam'].isLocked = true;

      craftingModule.setCraftingEffort({ id: 'craft_wooden_beam', effort: 0.8, filterId: 'crafting' });

      expect(craftingModule.craftingSlots['craft_wooden_beam'].effort).toBeLessThanOrEqual(1);
    });

    test('should handle locked recipe changes correctly', () => {
      const recipeId = 'craft_wooden_beam';

      craftingModule.craftingSlots[recipeId] = {
        effort: 0.5,
        filterId: 'crafting',
        isLocked: false
      };

      // Toggle lock manually
      craftingModule.craftingSlots[recipeId].isLocked = true;

      expect(craftingModule.craftingSlots[recipeId].isLocked).toBe(true);

      // Try to change effort of locked recipe
      craftingModule.setCraftingEffort({
        id: recipeId,
        effort: 0.8,
        filterId: 'crafting'
      });

      // Should be limited to available space
      expect(craftingModule.craftingSlots[recipeId].effort).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Resource Availability Logic', () => {
    test('should correctly handle resource production vs consumption', () => {
      const recipeId = 'craft_wooden_beam';

      // Mock resource with positive balance (being produced)
      gameResources.getResource.mockImplementation((id) => {
        if (id === 'refined_wood') {
          return {
            id,
            name: 'Refined Wood',
            amount: 5, // Low amount
            balance: 2  // But being produced at 2/sec
          };
        }
        return {
          id,
          name: `Resource ${id}`,
          amount: 100,
          balance: 10
        };
      });

      // Mock consumption effects
      gameEntity.getEffects.mockReturnValue([
        {
          scope: 'consumption',
          type: 'resources',
          id: 'refined_wood',
          value: -1 // Consumes 1 refined wood per second
        }
      ]);

      // Test with 1 second duration
      const canRun = craftingModule.canRunRecipeAtEffortForDuration(recipeId, 0.5, 1);

      // Should be able to run since balance (2) > consumption (0.5)
      expect(canRun).toBe(true);
    });

    test('should reject recipe when resource is being consumed faster than produced', () => {
      const recipeId = 'craft_wooden_beam';

      resourceState = {
        refined_wood: { amount: 5, balance: -2 }
      };

      gameEntity.getEffects.mockImplementation((id, level, level2, isUnlocked, p1, p2, effort) =>
        effectsMap[id] || []
      );

      const canRun = craftingModule.canRunRecipeAtEffortForDuration(recipeId, 1.0, 3);

      expect(canRun).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple dependent recipes correctly', () => {
      // Clear allocations first
      craftingModule.originalAllocations = {};

      // Setup chain: wood -> refined wood -> wooden beam
      craftingModule.setCraftingEffort({ id: 'craft_wood', effort: 0.4, filterId: 'crafting' });
      craftingModule.setCraftingEffort({ id: 'craft_refined_wood', effort: 0.3, filterId: 'crafting' });
      craftingModule.setCraftingEffort({ id: 'craft_wooden_beam', effort: 0.3, filterId: 'crafting' });

      craftingModule.autoRebalanceEnabled = true;

      // Simulate wood becoming inefficient
      resourceState = {
        log: { amount: 0, balance: -10 }
      };

      activeEfficiencies = {
        craft_wood: 0.5,
        craft_refined_wood: 1,
        craft_wooden_beam: 1
      };

      craftingModule.checkAndRebalance('crafting');

      expect(craftingModule.craftingSlots['craft_wood'].effort).toBeLessThan(0.4);
      expect(craftingModule.craftingSlots['craft_refined_wood'].effort).toBeLessThanOrEqual(0.3);
      expect(craftingModule.craftingSlots['craft_wooden_beam'].effort).toBeLessThanOrEqual(0.3);
    });

    test('should handle recipe with zero effort correctly', () => {
      const recipeId = 'craft_wooden_beam';

      craftingModule.originalAllocations = {};

      craftingModule.craftingSlots[recipeId] = {
        effort: 0,
        filterId: 'crafting'
      };
      craftingModule.originalAllocations[recipeId] = 0.5;

      craftingModule.tryRestoreIndividualRecipes('crafting');

      expect(craftingModule.craftingSlots[recipeId].effort).toBe(0);
      expect(craftingModule.originalAllocations[recipeId]).toBe(0.5);
    });

    test('should handle alchemy category separately', () => {
      const alchemyRecipe = 'craft_mental_potion';

      // Clear allocations first
      craftingModule.alchemyOriginalAllocations = {};

      craftingModule.alchemyAutoRebalanceEnabled = true;

      craftingModule.craftingSlots[alchemyRecipe] = {
        effort: 0.3,
        filterId: 'alchemy'
      };

      gameEntity.entityExists.mockImplementation((id) => id === `activeCrafting_${alchemyRecipe}`);
      gameEntity.getEntity.mockImplementation((id) => {
        if (id === `activeCrafting_${alchemyRecipe}`) {
          return { modifier: { efficiency: 0.4, bottleNeck: 'alchemy_resource' } };
        }
        return {
          id,
          name: `Recipe ${id}`,
          tags: ['recipe', 'alchemy'],
          resourceId: id
        };
      });

      craftingModule.checkAndRebalance('alchemy');

      gameEntity.getEntity.mockImplementation((id) => {
        if (id === `activeCrafting_${alchemyRecipe}`) {
          return { modifier: { efficiency: 1, bottleNeck: null } };
        }
        return {
          id,
          name: `Recipe ${id}`,
          tags: ['recipe', 'alchemy'],
          resourceId: id
        };
      });

      craftingModule.checkAndRebalance('alchemy');

      expect(craftingModule.craftingSlots[alchemyRecipe].effort).toBe(0.3);
    });
  });
});
