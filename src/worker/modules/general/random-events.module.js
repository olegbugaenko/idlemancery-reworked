import { GameModule } from "../../shared/game-module";
import { registerRandomEventsDb } from "./random-events-db";
import {gameResources, resourceApi, resourceCalculators} from "game-framework";

export class RandomEventsModule extends GameModule {
    constructor() {
        super();
        this.activeEvents = {}; // Об'єкт активних подій, ключі - id подій
        this.isEventOpened = false; // Чи відкрита подія
        this.eventsDB = {}; // База всіх доступних подій
        this.openedEventId = null; // ID поточно відкритої події
        this.revealedEffects = {};

        this.eventHandler.registerHandler('set-event-data-opened', ({ isOpened, eventId }) => {
            console.log('SettOpened: ', isOpened, eventId);
            this.openedEventId = isOpened ? eventId : null; // Зберігаємо ID відкритої події
            if (eventId && this.activeEvents[eventId]) {
                this.activeEvents[eventId].isOpened = isOpened;
            }
            this.sendData();
        });

        this.eventHandler.registerHandler('select-event-option', ({ eventId, optionId }) => {
            this.selectOption(eventId, optionId);
            this.sendData();
        });

        this.eventHandler.registerHandler('query-event-data', ({ prefix }) => {
            this.sendData(prefix);
        });
    }

    initialize() {
        this.eventsDB = registerRandomEventsDb().reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }

    tick(game, delta) {

        // Очищаємо прострочені події
        for (const [id, event] of Object.entries(this.activeEvents)) {
            if(!this.activeEvents[id].expiresIn || this.activeEvents[id].expiresIn > 3600) {
                this.activeEvents[id].expiresIn = 0;
            }
            this.activeEvents[id].expiresIn -= delta;
            if (this.activeEvents[id].expiresIn <= 0) {
                delete this.activeEvents[id];
            }
        }

        // Генеруємо нові події, якщо кількість активних подій менша за 5
        if (Object.keys(this.activeEvents).length < 5 && Math.random() < delta * 0.005) {
            this.triggerRandomEvent();
        }
    }

    triggerRandomEvent() {
        const availableEvents = Object.values(this.eventsDB).filter(event =>
            event.unlockCondition() &&
            !this.activeEvents[event.id] // Перевіряємо, чи немає вже події з таким id
        );

        if (availableEvents.length === 0) return;

        const totalProbability = availableEvents.reduce((sum, event) => sum + event.probability, 0);
        let randomValue = Math.random() * totalProbability;

        for (const event of availableEvents) {
            if (randomValue < event.probability) {
                this.activeEvents[event.id] = {
                    expiresIn: 20 * 60, // Дійсна 20 хвилин
                    isOpened: false, // Чи відкрита подія
                    selectedOptionId: null, // Вибрана опція
                    triggeredEffect: null // Ефект, що спрацював
                };
                if(!this.openedEventId) {
                    this.openedEventId = event.id;
                    this.activeEvents[event.id].isOpened = true;
                }
                this.sendData();
                return;
            }
            randomValue -= event.probability;
        }
    }

    selectOption(eventId, optionId) {
        const event = this.activeEvents[eventId];
        if (!event) return;

        const eventData = this.eventsDB[eventId];
        if (!eventData) return;

        const option = eventData.options[optionId];
        if (!option || !option.unlockCondition()) return;

        // Виконуємо вибір опції
        const availableEffects = option.effects.filter(effect => effect.unlockCondition());
        if (availableEffects.length === 0) {
            event.selectedOptionId = optionId;
            return;
        }

        const totalProbability = availableEffects.reduce((sum, effect) => sum + effect.probability, 0);
        let randomValue = Math.random() * totalProbability;

        let triggeredEffect = null;
        for (const effect of availableEffects) {
            if (randomValue < effect.probability) {
                triggeredEffect = effect;
                effect.onTrigger();
                this.revealEffect(eventId, optionId, effect.id);
                break;
            }
            randomValue -= effect.probability;
        }

        // Зберігаємо вибрану опцію та ефект
        event.selectedOptionId = optionId;
        event.triggeredEffect = triggeredEffect;
        this.activeEvents[eventId].expiresIn = Math.min(this.activeEvents[eventId].expiresIn, 60);
    }

    checkRevealedEvent(eventId) {
        let wholeRevealed = true;
        for(const oId in this.eventsDB[eventId].options) {
            if(!this.revealedEffects[eventId][oId]?.d && this.eventsDB[eventId].options[oId]?.effects?.length) {
                wholeRevealed = false;
            }
        }
        if(wholeRevealed) {
            this.revealedEffects[eventId] = { // minimizing data, since event revealed
                d: true
            }
        }
        console.log('REVELATION_EVENT: ', eventId,wholeRevealed);

        return wholeRevealed;
    }

    revealEffect(eventId, optionId, effectId) {

        console.log('REVELATION_CHECK: ', eventId, this.revealedEffects[eventId]);

        if(!this.revealedEffects[eventId]) {
            this.revealedEffects[eventId] = {};
        }

        // Everything is already revealed
        if(this.revealedEffects[eventId].d) return;

        if(!this.revealedEffects[eventId][optionId]) {
            if(!this.eventsDB[eventId].options[optionId].effects?.length) {
                this.revealedEffects[eventId][optionId] = {
                    d: true
                }

                this.checkRevealedEvent(eventId);
                return;
            }
            this.revealedEffects[eventId][optionId] = {
                u: this.eventsDB[eventId].options[optionId].effects.reduce((acc, eff) => ({
                    ...acc,
                    [eff.id]: true
                }), {}) // Implement storing unrevealed yet effects
            };
        }
        // Everything is revealed for option
        if(this.revealedEffects[eventId][optionId].d || !this.revealedEffects[eventId][optionId].u[effectId]) {
            this.checkRevealedEvent(eventId);
            return;
        }

        delete this.revealedEffects[eventId][optionId].u[effectId]; // deleting from unrevealed
        console.log('REVELATION: ', eventId, optionId, effectId, this.revealedEffects[eventId][optionId]);

        if(Object.values(this.revealedEffects[eventId][optionId].u).length <= 0) {
            this.revealedEffects[eventId][optionId].d = true;
            delete this.revealedEffects[eventId][optionId]["u"];
            this.checkRevealedEvent(eventId);
        }
    }

    getRevealedEffects(eventId, optionId) {
        const totalProbability = this.eventsDB[eventId].options[optionId].effects.reduce((sum, effect) => sum + effect.probability, 0);

        if(totalProbability <= 0) {
            // no effects attached
            return [{
                id: 'nothing',
                description: 'Nothing happens',
                probability: 1
            }]
        }

        if(!this.revealedEffects[eventId]?.d && !this.revealedEffects[eventId]?.[optionId]) return [];


        return this.eventsDB[eventId].options[optionId].effects.filter(optionEffect => {
            if(this.revealedEffects[eventId]?.d) return true;
            if(this.revealedEffects[eventId]?.[optionId]?.d) return true;

            return this.revealedEffects[eventId]?.[optionId]?.u && !(optionEffect.id in this.revealedEffects[eventId]?.[optionId]?.u)
        }).map(optionEffect => ({
            id: optionEffect.id,
            description: optionEffect.description,
            probability: optionEffect.probability / totalProbability
        }))
    }

    getOptionAffordable(option) {
        const result = {
            isAffordable: true,
            consume: {}
        };
        if (option.usageGain) {
            const effects = resourceApi.unpackEffects(option.usageGain, 1);
            if (effects.length) {
                const resourcesToRemove = effects.filter(eff => eff.scope === 'consumption' && eff.type === 'resources');

                resourcesToRemove.forEach(resource => {
                    result.consume[resource.id] = resource.value;
                    if (result.consume[resource.id] > gameResources.getResource(resource.id).amount) {
                        result.isAffordable = false;
                    }
                });
            }
        }
        return result;
    }

    getData() {
        // Сортуємо активні події за експірейшином
        const activeEventList = Object.entries(this.activeEvents)
            .map(([id, event]) => ({
                id,
                expiresIn: event.expiresIn,
                isOpened: event.isOpened,
                selectedOptionId: event.selectedOptionId,
            }))
            .sort((a, b) => a.expiresIn - b.expiresIn);

        // Формуємо дані про відкриту подію
        const openedEventData = this.openedEventId && this.activeEvents[this.openedEventId]
            ? (() => {
                const eventData = this.eventsDB[this.openedEventId];
                if (!eventData) return null;

                return {
                    id: this.openedEventId,
                    name: eventData.name,
                    description: eventData.description,
                    options: Object.values(eventData.options).map(option => ({
                        id: option.id,
                        name: option.name,
                        description: option.description,
                        affordable: resourceCalculators.isAffordable(this.getOptionAffordable(option).consume),
                        revealedEffects: this.getRevealedEffects(this.openedEventId, option.id)
                    })),
                    selectedOption: this.activeEvents[this.openedEventId].selectedOptionId
                        ? {
                            id: this.activeEvents[this.openedEventId].selectedOptionId,
                            name: eventData.options[this.activeEvents[this.openedEventId].selectedOptionId].name,
                            description: eventData.options[this.activeEvents[this.openedEventId].selectedOptionId].description,
                            triggeredEffect: this.activeEvents[this.openedEventId].triggeredEffect
                                ? {
                                    id: this.activeEvents[this.openedEventId].triggeredEffect.id,
                                    name: this.activeEvents[this.openedEventId].triggeredEffect.name,
                                    description: this.activeEvents[this.openedEventId].triggeredEffect.description
                                }
                                : null
                        }
                        : null
                };
            })()
            : null;

        return {
            list: activeEventList.map(event => ({
                id: event.id,
                name: this.eventsDB[event.id]?.name,
                selectedOption: event.selectedOptionId,
                expiresIn: event.expiresIn // Час до завершення
            })),
            openedEventData
        };
    }

    sendData(prefix) {
        const data = this.getData();
        let label = 'random-events-data';
        if (prefix) {
            label = `${label}-${prefix}`;
        }
        this.eventHandler.sendData(label, data);
    }

    save() {
        return {
            activeEvents: this.activeEvents,
            revealedEffects: this.revealedEffects
        };
    }

    load(obj) {
        if (obj?.activeEvents) {
            this.activeEvents = obj.activeEvents;
        }
        this.revealedEffects = obj?.revealedEffects || {};
        this.sendData();
    }
}
