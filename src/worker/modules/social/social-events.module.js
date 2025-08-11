import {GameModule} from "../../shared/game-module";
import {gameEntity, gameResources, gameEffects, gameCore, resourceCalculators} from "game-framework";
import {registerEventsStage1} from "./social-events-db";

export class EventsModule extends GameModule {

    constructor() {
        super();
        this.activeEvent = null;
        this.eventStartTime = 0;
        this.eventEndTime = 0;
        this.cooldownEndTime = 0; // Глобальний кулдаун для Event Hall
        this.autoEvents = {}; // Автоматизація подій
        this.eventHistory = {}; // Історія проведених подій
    }

    initialize() {
        registerEventsStage1();
        this.loadEventHistory();
        
        // API handlers
        this.eventHandler.registerHandler('query-social-events', () => {
            this.sendEventsData();
        });

        this.eventHandler.registerHandler('query-social-events-stats', () => {
            this.sendEventsData({prefix: 'stats'});
        });

        this.eventHandler.registerHandler('start-event', (payload) => {
            const result = this.startEvent(payload.eventId);
            this.eventHandler.sendData('event-result', result);
        });

        this.eventHandler.registerHandler('set-auto-event', (payload) => {
            this.setAutoEvent(payload.eventId, payload.enabled);
        });

        this.eventHandler.registerHandler('query-event-details', (payload) => {
            const details = this.getEventDetails(payload.eventId);
            this.eventHandler.sendData('event-details', details);
        });
    }

    tick(game, delta) {
        const currentTime = gameCore.globalTime;

        // Оновлюємо тривалість активної події
        if (this.activeEvent) {
            const timeLeftSeconds = Math.max(0, this.eventEndTime - currentTime);
            if (gameEntity.entityExists(`active_${this.activeEvent}`)) {
                gameEntity.setAttribute(`active_${this.activeEvent}`, 'current_duration', timeLeftSeconds);
            }
            
            // Перевіряємо чи завершилася активна подія
            if (currentTime >= this.eventEndTime) {
                this.completeEvent();
            }
        }

        // Перевіряємо автоматизацію подій
        this.checkAutoEvents(currentTime);
    }

    // Почати подію
    startEvent(eventId) {
        if (this.activeEvent) {
            return { success: false, message: 'Another event is already active' };
        }

        const eventEntity = gameEntity.getEntity(eventId);
        if (!eventEntity) {
            return { success: false, message: 'Event not found' };
        }

        // Перевіряємо чи є достатньо ресурсів
        const cost = eventEntity.get_cost();
        const affordability = gameEntity.getAffordable(eventId);
        if (!affordability.isAffordable) {
            return { success: false, message: 'Not enough resources' };
        }

        // Перевіряємо кулдаун
        if (gameCore.globalTime < this.cooldownEndTime) {
            return { success: false, message: 'Event Hall is on cooldown' };
        }

        // Списуємо ресурси
        for (const [resourceId, costData] of Object.entries(cost)) {
            const amount = costData.A + costData.B;
            gameResources.addResource(resourceId, -amount);
        }

        // Запускаємо подію
        this.activeEvent = eventId;
        this.eventStartTime = gameCore.globalTime;
        this.eventEndTime = gameCore.globalTime + (eventEntity.attributes.eventDuration / 1000); // Конвертуємо в секунди

        // Реєструємо активну подію
        gameEntity.registerGameEntity(`active_${eventId}`, {
            copyFromId: eventId,
            isAbstract: false,
            level: 1,
            tags: ['active_event', 'active_effect'],
            scope: 'events',
            customIcon: 'temporary_knowledge_buff',
            unlockedBy: undefined,
        });

        this.sendEventsData();

        return { success: true, message: 'Event started successfully' };
    }

    // Завершити подію
    completeEvent() {
        if (!this.activeEvent) return;

        const eventEntity = gameEntity.getEntity(this.activeEvent);

        // Видаляємо активну подію
        if (gameEntity.entityExists(`active_${this.activeEvent}`)) {
            gameEntity.unsetEntity(`active_${this.activeEvent}`);
        }

        // Оновлюємо історію
        if (!this.eventHistory[this.activeEvent]) {
            this.eventHistory[this.activeEvent] = 0;
        }
        this.eventHistory[this.activeEvent]++;

        // Оновлюємо постійний бонус
        this.updatePermanentBonus(this.activeEvent);

        this.saveEventHistory();

        // Встановлюємо кулдаун
        const cooldownDuration = (eventEntity?.attributes.eventCooldown || 30 * 60 * 1000) / 1000; // Конвертуємо в секунди
        this.cooldownEndTime = gameCore.globalTime + cooldownDuration;

        this.activeEvent = null;
        this.eventStartTime = 0;
        this.eventEndTime = 0;

        this.sendEventsData();
    }

    // Оновити постійний бонус
    updatePermanentBonus(eventId) {
        const eventEntity = gameEntity.getEntity(eventId);
        if (!eventEntity) return;

        const permanentBonusId = `${eventId}_permanent_bonus`;
        const timesCompleted = this.eventHistory[eventId] || 0;
        
        if (timesCompleted > 0) {
            gameEntity.setEntityLevel(permanentBonusId, timesCompleted, true);
        }
    }

    // Встановити автоматизацію події
    setAutoEvent(eventId, enabled) {
        if (enabled) {
            // Якщо вмикаємо автоматизацію для однієї події, вимикаємо всі інші
            for (const key in this.autoEvents) {
                this.autoEvents[key] = false;
            }
        }
        this.autoEvents[eventId] = enabled;
        this.sendEventsData();
    }

    // Перевірити автоматизацію подій
    checkAutoEvents(currentTime) {
        if (this.activeEvent || currentTime < this.cooldownEndTime) return;

        for (const [eventId, enabled] of Object.entries(this.autoEvents)) {
            if (enabled) {
                const eventEntity = gameEntity.getEntity(eventId);
                if (eventEntity) {
                    // Перевіряємо чи є достатньо ресурсів
                    const cost = eventEntity.get_cost();
                    const affordability = gameEntity.getAffordable(eventId);
                    
                    if (affordability.isAffordable) {
                        
                        this.startEvent(eventId);
                        break; // Запускаємо тільки одну подію за раз
                    }
                }
            }
        }
    }

    // Отримати дані про події
    getEventsData() {
        const events = [];
        const eventEntities = gameEntity.listEntitiesByTags(['event-hall']);

        for (const [index, eventEntity] of Object.entries(eventEntities)) {
            if (eventEntity.attributes?.isEvent) {
                
                const eventId = eventEntity.id;
                const isActive = this.activeEvent === eventId;
                const isOnCooldown = gameCore.globalTime < this.cooldownEndTime;
                const canStart = !this.activeEvent && !isOnCooldown;
                const affordable = gameEntity.getAffordable(eventId);
                const timesCompleted = this.eventHistory[eventId] || 0;
                const isAutoEnabled = this.autoEvents[eventId] || false;

                events.push({
                    id: eventId,
                    name: eventEntity.name,
                    description: eventEntity.description,
                    cost: eventEntity.get_cost(),
                    affordable,
                    category: eventEntity.category,
                    isActive,
                    isOnCooldown,
                    canStart,
                    hasEnoughResources: affordable.isAffordable,
                    timesCompleted,
                    isAutoEnabled,
                    progress: isActive ? Math.min(1, (gameCore.globalTime - this.eventStartTime) / ((eventEntity.attributes.eventDuration || 1) / 1000)) : 0,
                    timeRemaining: isActive ? Math.max(0, (this.eventEndTime - gameCore.globalTime) * 1000) : 0, // Конвертуємо в мілісекунди для UI
                    cooldownRemaining: isOnCooldown ? Math.max(0, (this.cooldownEndTime - gameCore.globalTime) * 1000) : 0, // Конвертуємо назад в мілісекунди для UI
                    cooldown: eventEntity.attributes.eventCooldown || 30 * 60 * 1000
                });
            }
        }

        return {
            events,
            activeEvent: this.activeEvent,
            autoEvents: this.autoEvents
        };
    }

    // Отримати деталі події
    getEventDetails(eventId) {
        const eventEntity = gameEntity.getEntity(eventId);
        if (!eventEntity || !eventEntity.attributes?.isEvent) {
            return null;
        }

        const permanentBonusId = `${eventId}_permanent_bonus`;
        const activeEventId = `active_${eventId}`;
        const timesCompleted = this.eventHistory[eventId] || 0;
        const permanentBonusLevel = gameEntity.getLevel(permanentBonusId) || 0;

        return {
            id: eventId,
            name: eventEntity.name,
            description: eventEntity.description,
            cost: eventEntity.get_cost(),
            category: eventEntity.category,
            duration: eventEntity.attributes.eventDuration,
            cooldown: eventEntity.attributes.eventCooldown,
            timesCompleted,
            permanentBonusLevel,
            permanentEffect: eventEntity.permanentEffect,
            temporaryEffect: eventEntity.temporaryEffect,
            isUnlocked: gameEntity.isEntityUnlocked(eventId),
            affordable: gameEntity.getAffordable(eventId),
            currentEffects: gameEntity.getEffects(eventId, 0, null, true),
            potentialEffects: gameEntity.getEffects(eventId, 1, null, true),
            permanentBonusEffects: gameEntity.getEffects(permanentBonusId),
            permanentBonusPotentialEffects: gameEntity.getEffects(permanentBonusId, 1),
            activeEventEffects: gameEntity.entityExists(activeEventId) ? gameEntity.getEffects(activeEventId) : [],
            activeEventPotentialEffects: gameEntity.entityExists(activeEventId) ? gameEntity.getEffects(activeEventId, 1) : []
        };
    }

    sendEventsData(options) {
        const data = this.getEventsData();
        this.eventHandler.sendData(`social-events-data${options?.prefix ? '-'+options.prefix : ''}`, data);
    }

    // Збереження/завантаження
    save() {
        return {
            activeEvent: this.activeEvent,
            eventStartTime: this.eventStartTime,
            eventEndTime: this.eventEndTime,
            cooldownEndTime: this.cooldownEndTime,
            autoEvents: this.autoEvents,
            eventHistory: this.eventHistory
        };
    }

    load(saveObject) {
        this.activeEvent = null;
        this.eventStartTime = 0;
        this.eventEndTime = 0;
        this.cooldownEndTime = 0;
        this.autoEvents = {};
        this.eventHistory = {};
            
        if (saveObject) {
            this.activeEvent = saveObject.activeEvent || null;
            this.eventStartTime = saveObject.eventStartTime || 0;
            this.eventEndTime = saveObject.eventEndTime || 0;
            this.cooldownEndTime = saveObject.cooldownEndTime || 0;
            this.autoEvents = saveObject.autoEvents || {};
            this.eventHistory = saveObject.eventHistory || {};
            
            // Відновлюємо активну подію якщо вона була активна
            if (this.activeEvent && this.eventEndTime > gameCore.globalTime) {
                const eventEntity = gameEntity.getEntity(this.activeEvent);
                if (eventEntity) {
                    gameEntity.registerGameEntity(`active_${this.activeEvent}`, {
                        copyFromId: this.activeEvent,
                        isAbstract: false,
                        level: 1,
                        tags: ['active_event', 'active_effect'],
                        scope: 'events',
                        unlockedBy: undefined,
                        customIcon: 'temporary_knowledge_buff',
                    });
                }
            }
        }
        
        // Відновлюємо постійні бонуси після завантаження
        this.loadEventHistory();
    }

    loadEventHistory() {
        // Оновлюємо всі постійні бонуси при завантаженні
        for (const [eventId, timesCompleted] of Object.entries(this.eventHistory)) {
            const permanentBonusId = `${eventId}_permanent_bonus`;
            if (timesCompleted > 0) {
                gameEntity.setEntityLevel(permanentBonusId, timesCompleted, true);
            }
        }
    }

    saveEventHistory() {
        // Історія зберігається в save() методі
        // Цей метод викликається для синхронізації даних
    }
} 