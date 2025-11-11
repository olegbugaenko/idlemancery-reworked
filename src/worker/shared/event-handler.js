export class EventHandler {

    handlers = {};

    static instance = null;
    handlers = {};

    constructor() {
        if (EventHandler.instance) {
            return EventHandler.instance;
        }
        EventHandler.instance = this;
    }

    registerHandler(event, cb) {
        this.handlers[event] = cb;
    }

    processEvent(event) {
        if(!event.data) return;

        const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if(!parsed || !parsed.event || !this.handlers[parsed.event] ) {
            throw new Error(`Invalid event: ${parsed.event}`)
        }

        return this.handlers[parsed.event](parsed.payload);
    }

    sendData(event, payload) {
        postMessage({ event, payload })
    }

    // some generic keys
    playSound(key) {
        this.sendData('play-sound', { key });
    }

}
