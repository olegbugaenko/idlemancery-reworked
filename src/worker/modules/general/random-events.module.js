import { GameModule } from "../../shared/game-module";
import { registerRandomEventsDb } from "./random-events-db";
import {gameResources, resourceApi, resourceCalculators} from "game-framework";

export class RandomEventsModule extends GameModule {
    constructor() {
        super();
        this.ongoingEventId = null;
        this.ongoingEventTimeout = 0;
        this.selectedOption = null;
        this.effectTriggeredIdx = null;
        this.isEventOpened = false;
        this.eventsDB = [];

        this.eventHandler.registerHandler('set-event-data-opened', (isOpened) => {
            this.isEventOpened = isOpened;
            this.sendData();
        });

        this.eventHandler.registerHandler('select-event-option', (optionId) => {
            this.selectOption(optionId);
            this.sendData();
        });

        this.eventHandler.registerHandler('query-event-data', ({prefix}) => {
            this.sendData(prefix);
        });
    }

    initialize() {
        this.eventsDB = registerRandomEventsDb();
    }

    tick(game, delta) {
        if (this.ongoingEventId) {
            this.ongoingEventTimeout -= delta;
            if (this.ongoingEventTimeout <= 0) {
                this.ongoingEventTimeout = 0;
                this.leaveEvent();
            }
        } else {
            if (Math.random() < delta * 0.01) {
                console.log('Triggering Event!')
                this.triggerRandomEvent();
            }
        }
    }

    triggerRandomEvent() {
        const availableEvents = this.eventsDB.filter(event => event.unlockCondition());
        if (availableEvents.length === 0) return;

        const totalProbability = availableEvents.reduce((sum, event) => sum + event.probability, 0);
        let randomValue = Math.random() * totalProbability;

        for (const event of availableEvents) {
            if (randomValue < event.probability) {
                this.ongoingEventId = event.id;
                this.ongoingEventTimeout = 120; // Time that this quest will be available
                this.sendData();
                return;
            }
            randomValue -= event.probability;
        }
    }

    selectOption(optionId) {
        if (!this.ongoingEventId) return;

        const currEvent = this.eventsDB.find(event => event.id === this.ongoingEventId);
        if (!currEvent || !currEvent.options[optionId]) return;

        const option = currEvent.options[optionId];
        if (!option.unlockCondition()) return;

        this.selectedOption = optionId;

        // Choose a random effect based on probability
        const availableEffects = option.effects.filter(effect => effect.unlockCondition());
        if (availableEffects.length === 0) return;

        const totalProbability = availableEffects.reduce((sum, effect) => sum + effect.probability, 0);
        let randomValue = Math.random() * totalProbability;

        for (let i = 0; i < availableEffects.length; i++) {
            if (randomValue < availableEffects[i].probability) {
                this.effectTriggeredIdx = i;
                availableEffects[i].onTrigger();
                return;
            }
            randomValue -= availableEffects[i].probability;
        }
    }

    leaveEvent() {
        this.ongoingEventId = null;
        this.selectedOption = null;
        this.effectTriggeredIdx = null;
        this.ongoingEventTimeout = 0;
        this.isEventOpened = false;
        this.sendData();
    }

    getData() {
        const result = {};

        if (this.ongoingEventId) {
            const currEvent = this.eventsDB.find(event => event.id === this.ongoingEventId);
            if (currEvent) {
                const dataToSend = {
                    name: currEvent.name,
                    description: currEvent.description,
                    options: Object.values(currEvent.options).filter(one => one.unlockCondition()).map(option => ({
                        id: option.id,
                        name: option.name,
                        description: option.description,
                        affordable: resourceCalculators.isAffordable(this.getOptionAffordable(option).consume)
                    })),
                    ongoingEventTimeout: this.ongoingEventTimeout
                };

                if (this.selectedOption) {
                    const option = currEvent.options[this.selectedOption];
                    dataToSend.selectedOption = {
                        id: option.id,
                        name: option.name,
                        description: option.description,
                        effects: this.effectTriggeredIdx != null ? {
                            id: option.effects[this.effectTriggeredIdx].id,
                            name: option.effects[this.effectTriggeredIdx].description
                        } : null
                    };
                    if(this.effectTriggeredIdx != null && this.effectTriggeredIdx > -1) {
                        dataToSend.triggeredEffect = {
                            name: option.effects[this.effectTriggeredIdx].name,
                            description: option.effects[this.effectTriggeredIdx].description
                        }
                    }
                }

                result.currentEvent = dataToSend;
                result.isEventOpened = this.isEventOpened;
            }
        }

        return result;
    }

    sendData(prefix) {
        const data = this.getData();
        let label = 'random-events-data';
        if(prefix) {
            label = `${label}-${prefix}`;
        }
        this.eventHandler.sendData(label, data);
    }

    save() {
        return {
            ongoingEventId: this.ongoingEventId,
            ongoingEventTimeout: this.ongoingEventTimeout,
            effectTriggeredIdx: this.effectTriggeredIdx,
            selectedOption: this.selectedOption,
        };
    }

    load(obj) {
        this.ongoingEventId = obj?.ongoingEventId || null;
        this.ongoingEventTimeout = obj?.ongoingEventTimeout || 0;
        this.selectedOption = obj?.selectedOption;
        this.effectTriggeredIdx = obj?.effectTriggeredIdx;
        this.sendData();
    }

    getOptionAffordable(option) {
        let result = {
            isAffordable: true,
            consume: {}
        }
        if(option.usageGain) {
            const effects = resourceApi.unpackEffects(option.usageGain, 1);
            if(effects.length) {
                const rsToRemove = effects.filter(eff => eff.scope === 'consumption' && eff.type === 'resources');

                rsToRemove.forEach(rs => {
                    result.consume[rs.id] = rs.value;
                    if(result.consume[rs.id] > gameResources.getResource(rs.id).amount) {
                        result.isAffordable = false;
                    }
                })
            }

        }
        return result;
    }
}