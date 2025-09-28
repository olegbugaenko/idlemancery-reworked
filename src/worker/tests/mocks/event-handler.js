// Mock EventHandler for testing
class EventHandler {
  constructor() {
    this.handlers = {};
  }

  registerHandler(event, handler) {
    this.handlers[event] = handler;
  }

  sendData(event, payload) {
    if (this.handlers[event]) {
      this.handlers[event](payload);
    }
  }
}

module.exports = { EventHandler };
