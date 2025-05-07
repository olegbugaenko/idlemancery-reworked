import {mainModule, MainModule} from "./main.module";

const mainGame = mainModule();

self.addEventListener('message', (event) => {
    // Perform some computation
    mainGame.eventHandler.processEvent(event);
    /*const result = {
        received: event.data
    };
    self.postMessage(JSON.stringify({event: 'initialized', payload: result}));*/
});
