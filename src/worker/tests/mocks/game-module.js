// Mock GameModule for testing
const EventHandler = require('./event-handler').EventHandler;

class GameModule {
  constructor(props) {
    this.props = props;
    this.eventHandler = new EventHandler();
  }
}

module.exports = { GameModule };
