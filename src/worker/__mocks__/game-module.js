// Mock GameModule for testing
const GameModule = jest.fn().mockImplementation(() => ({
  eventHandler: {
    registerHandler: jest.fn(),
    sendData: jest.fn()
  }
}));

module.exports = { GameModule };
