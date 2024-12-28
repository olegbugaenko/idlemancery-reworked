import {GameModule} from "../game-module";
import {gameCore} from "game-framework";

export class UnlockNotificationsModule extends GameModule {

    constructor() {
        super();

        this.notifications = {};

        this.byId = {};

        this.eventHandler.registerHandler('query-new-unlocks-notifications', payload => {
            this.sendNewUnlocks(payload);
        })

        this.eventHandler.registerHandler('set-new-notification-viewed', payload => {
            this.setViewed(payload.scope, payload.category, payload.id);
        })

        this.eventHandler.registerHandler('set-all-new-notification-viewed', payload => {
            this.setAllViewed();
        })

        this.eventHandler.registerHandler('set-new-notification-viewed-by-id', payload => {
            this.setViewedById(payload.id);
        })
    }

    initialize() {

    }

    tick() {

    }

    registerPath(scope, category, id) {
        if(!this.notifications[scope]) {
            this.notifications[scope] = {}
        }
        if(!this.notifications[scope][category]) {
            this.notifications[scope][category] = {}
        }
        if(!this.notifications[scope][category][id]) {
            this.notifications[scope][category][id] = {
                isUnlocked: false,
                isViewed: false,
            }
        }
        if(!this.byId[id]) {
            this.byId[id] = []
        }
        if(!this.byId[id].find(one => one.scope === scope && one.category === category)) {
            this.byId[id].push({
                scope,
                category
            })
        }

    }

    registerNewNotification(scope, category, id, isUnlocked = false) {
        this.registerPath(scope, category, id);
        this.notifications[scope][category][id].isUnlocked = isUnlocked;
    }

    setViewed(scope, category, id, isViewed = true) {
        console.log('Setting viewed: ', scope, category, id);
        this.registerPath(scope, category, id);
        this.notifications[scope][category][id].isViewed = isViewed;
    }

    setViewedById(id, isViewed = true) {
        this.byId[id].forEach(pathData => {
            this.setViewed(pathData.scope, pathData.category, id, isViewed)
        })
    }

    setAllViewed() {
        for(const id in this.byId) {
            if(this.notifications[this.byId[id].scope][this.byId[id].category][id].isUnlocked) {
                this.setViewedById(id, true);
            }
        }
    }

    load(saveObj) {
        this.notifications = saveObj?.newNotifications || {};
        this.generateNotifications();
    }

    save() {
        return {
            newNotifications: this.notifications,
        }
    }

    generateNotifications() {
        // called each time when we should check notifications

        gameCore.getModule('actions').regenerateNotifications();
        gameCore.getModule('shop').regenerateNotifications();
        gameCore.getModule('inventory').regenerateNotifications();
        gameCore.getModule('property').regenerateNotifications();
        gameCore.getModule('crafting').regenerateNotifications();
        gameCore.getModule('plantations').regenerateNotifications();
        gameCore.getModule('magic').regenerateNotifications();
        gameCore.getModule('guilds').regenerateNotifications();
    }

    fetchCategoryNew(scope, category) {
        const results = {};
        for(const key in this.notifications[scope][category]) {
            if(this.notifications[scope][category][key].isUnlocked && !this.notifications[scope][category][key].isViewed) {
                results[key] = true;
            }
        }
        return results;
    }

    hasNewNotifications(scope = null, category = null, id = null) {
        const result = {};
        for(const scopeId in this.notifications) {
            if(scope && scopeId !== scope) {
                continue;
            }
            if(!result[scopeId]) {
                result[scopeId] = {
                    items: {},
                    hasNew: false,
                }
            }
            for(const categoryId in this.notifications[scopeId]) {
                if(category && category !== categoryId) {
                    continue;
                }
                if(!result[scopeId].items[categoryId]) {
                    result[scopeId].items[categoryId] = {
                        items: {},
                        hasNew: false,
                    }
                }
                for(const itemId in this.notifications[scopeId][categoryId]) {
                    if(id && id !== itemId) {
                        continue;
                    }
                    if(!result[scopeId].items[categoryId].items[itemId]) {
                        result[scopeId].items[categoryId].items[itemId] = {
                            items: {},
                            hasNew: false,
                        }
                    }
                    const hasNew = this.notifications[scopeId][categoryId][itemId].isUnlocked && !this.notifications[scopeId][categoryId][itemId].isViewed;

                    if(hasNew) {
                        result[scopeId].items[categoryId].items[itemId].hasNew = true;
                        result[scopeId].items[categoryId].hasNew = true;
                        result[scopeId].hasNew = true;
                    }
                }
            }
        }
        return result;
    }

    sendNewUnlocks(payload) {
        const result = this.hasNewNotifications(payload.scope, payload.category, payload.id);
        let label = 'new-unlocks-notifications';
        if(payload.suffix) {
            label = `${label}-${payload.suffix}`;
        }
        this.eventHandler.sendData(label, result);
    }

}