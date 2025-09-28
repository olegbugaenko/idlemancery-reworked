// Mock for game-framework module used in tests
const mockGameEntity = {
  getEntity: jest.fn(),
  entityExists: jest.fn(),
  registerGameEntity: jest.fn(),
  unsetEntity: jest.fn(),
  listEntitiesByTags: jest.fn(),
  setEntityLevel: jest.fn(),
  getEffects: jest.fn(),
  getAffordable: jest.fn(),
};

const mockGameResources = {
  getResource: jest.fn(),
};

const mockGameEffects = {
  getEffect: jest.fn(),
};

const mockGameCore = {
  getModule: jest.fn(),
};

const mockResourceCalculators = {};

module.exports = {
  gameCore: mockGameCore,
  gameEffects: mockGameEffects,
  gameEntity: mockGameEntity,
  gameResources: mockGameResources,
  resourceCalculators: mockResourceCalculators,
};
