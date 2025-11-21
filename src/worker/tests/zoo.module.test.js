jest.mock('../modules/workshop/zoo-db', () => ({
  registerZooAnimals: jest.fn(),
  ZOO_ANIMALS: [
    { id: 'animal_a', name: 'Animal A', description: '', icon: 'a', entityId: 'entity_a', feedEntityId: 'feed_a' },
    { id: 'animal_b', name: 'Animal B', description: '', icon: 'b', entityId: 'entity_b', feedEntityId: 'feed_b' },
  ],
}));

jest.mock('../../shared/utils/objects', () => ({
  packEffects: jest.fn(() => ({})),
}));

jest.mock('game-framework/src/utils/consts', () => ({
  SMALL_NUMBER: 0.000001,
}));

const { ZooModule } = require('../modules/workshop/zoo.module');
const { gameEntity, gameResources } = require('./mocks/game-framework');

describe('ZooModule limit normalization with locks', () => {
  let zooModule;

  beforeEach(() => {
    jest.clearAllMocks();

    gameEntity.getEffects.mockReturnValue([]);
    gameEntity.entityExists.mockReturnValue(false);
    gameEntity.registerGameEntity.mockImplementation(() => {});
    gameEntity.setEntityLevel.mockImplementation(() => {});

    gameResources.getResource.mockImplementation((id) => {
      if (id === 'magic_zoo_space') {
        return { income: 100, balance: 100, consumption: 0 };
      }
      return { id, name: id, income: 0, balance: 0, consumption: 0 };
    });

    zooModule = new ZooModule();
  });

  test('normalizes unlocked limits when total exceeds 100%', () => {
    zooModule.setAnimalLimit({ id: 'animal_a', percent: 0.6 });
    zooModule.setAnimalLimit({ id: 'animal_b', percent: 0.6 });

    expect(zooModule.animalsState.animal_a.limitPercent).toBeCloseTo(0.5);
    expect(zooModule.animalsState.animal_b.limitPercent).toBeCloseTo(0.5);
  });

  test('keeps locked limits while normalizing others', () => {
    zooModule.setAnimalLimit({ id: 'animal_a', percent: 0.6 });
    zooModule.toggleAnimalLimitLock({ id: 'animal_a', isLocked: true });
    zooModule.setAnimalLimit({ id: 'animal_b', percent: 0.6 });

    expect(zooModule.animalsState.animal_a.limitPercent).toBeCloseTo(0.6);
    expect(zooModule.animalsState.animal_b.limitPercent).toBeCloseTo(0.4);
  });

  test('toggling lock triggers renormalization', () => {
    zooModule.setAnimalLimit({ id: 'animal_a', percent: 0.7 });
    zooModule.setAnimalLimit({ id: 'animal_b', percent: 0.7 });

    zooModule.toggleAnimalLimitLock({ id: 'animal_a', isLocked: true });

    expect(zooModule.animalsState.animal_a.limitPercent).toBeCloseTo(0.7);
    expect(zooModule.animalsState.animal_b.limitPercent).toBeCloseTo(0.3);
  });
});
