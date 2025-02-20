import { GameModule } from "../game-module";
import { gameCore } from "game-framework";

export class UnlockNotificationsModule extends GameModule {

    constructor() {
        super();

        this.notifications = {};
        this.byId = {};
        this.viewedById = {};

        this.eventHandler.registerHandler('query-new-unlocks-notifications', payload => {
            this.sendNewUnlocks(payload);
        });

        this.eventHandler.registerHandler('set-new-notification-viewed', payload => {
            // Якщо додається четвертий рівень, він передається через payload.subcategory
            this.setViewed(payload.scope, payload.category, payload.subcategory, payload.id);
        });

        this.eventHandler.registerHandler('set-all-new-notification-viewed', payload => {
            this.setAllViewed();
        });

        this.eventHandler.registerHandler('set-new-notification-viewed-by-id', payload => {
            this.setViewedById(payload.id);
        });
    }

    // Порожні методи, як у початковій версії
    initialize() {
    }

    tick() {
    }

    /**
     * Метод, який реєструє шлях до повідомлення.
     * Якщо передано subcategory – використовується 4 рівень, інакше – залишається 3 рівня.
     */
    registerPath(scope, category, subcategory, id) {
        // Якщо немає запису для id, створюємо базову інформацію
        if (!this.viewedById[id]) {
            this.viewedById[id] = {
                isUnlocked: false,
                isViewed: false,
            };
        }
        // Рівень scope
        if (!this.notifications[scope]) {
            this.notifications[scope] = {};
        }
        // Рівень category
        if (!this.notifications[scope][category]) {
            this.notifications[scope][category] = {};
        }

        // Якщо передано subcategory – використовуємо четвертий рівень
        let target;
        if (subcategory !== undefined && subcategory !== null) {
            if (!this.notifications[scope][category][subcategory]) {
                this.notifications[scope][category][subcategory] = {};
            }
            target = this.notifications[scope][category][subcategory];
        } else {
            target = this.notifications[scope][category];
        }

        // Регіструємо повідомлення для даного id, якщо ще не було
        if (!target[id]) {
            target[id] = {
                isUnlocked: this.viewedById[id].isUnlocked,
                isViewed: this.viewedById[id].isViewed,
            };
        }

        // Зберігаємо шлях до цього id для синхронізації змін
        if (!this.byId[id]) {
            this.byId[id] = [];
        }
        if (!this.byId[id].find(one => one.scope === scope && one.category === category && one.subcategory === subcategory)) {
            this.byId[id].push({ scope, category, subcategory });
        }
    }

    /**
     * Синхронізує прапорці isViewed/isUnlocked у всіх шляхах (byId) для повідомлення з id.
     */
    syncNotificationCats(id) {
        if (!this.byId[id]) return;

        this.byId[id].forEach(({ scope, category, subcategory }) => {
            let target = (subcategory !== undefined && subcategory !== null)
                ? this.notifications[scope][category][subcategory]
                : this.notifications[scope][category];

            if (target && target[id]) {
                target[id].isViewed = this.viewedById[id].isViewed;
                target[id].isUnlocked = this.viewedById[id].isUnlocked;
            }
        });
    }

    /**
     * Реєструє нове повідомлення.
     * Якщо передано subcategory – використовується 4 рівень.
     */
    registerNewNotification(scope, category, subcategory, id, isUnlocked = false) {
        this.registerPath(scope, category, subcategory, id);
        this.viewedById[id].isUnlocked = isUnlocked;
        this.syncNotificationCats(id);
    }

    /**
     * Позначає повідомлення як переглянуте.
     * Якщо передано subcategory – використовується 4 рівень.
     */
    setViewed(scope, category, subcategory, id, isViewed = true) {
        console.log('Setting viewed: ', scope, category, subcategory, id);
        this.registerPath(scope, category, subcategory, id);
        this.viewedById[id].isViewed = isViewed;
        this.syncNotificationCats(id);
    }

    /**
     * Позначає повідомлення (за id) як переглянуте.
     */
    setViewedById(id, isViewed = true) {
        if (!this.byId[id]) {
            return;
        }
        this.viewedById[id].isViewed = isViewed;
        this.syncNotificationCats(id);
    }

    /**
     * Позначає всі повідомлення як переглянуті, якщо вони розблоковані.
     */
    setAllViewed() {
        for (const id in this.byId) {
            if (this.viewedById[id].isUnlocked) {
                this.setViewedById(id, true);
            }
        }
    }

    /**
     * Завантаження збережених даних.
     * Після завантаження відбувається генерація повідомлень.
     */
    load(saveObj) {
        this.viewedById = saveObj?.viewedById || {};
        this.generateNotifications();
    }

    /**
     * Зберігання даних.
     */
    save() {
        return {
            viewedById: this.viewedById,
        };
    }

    /**
     * Метод для генерації повідомлень.
     * Він викликає методи regenerateNotifications у різних модулях.
     */
    generateNotifications() {
        gameCore.getModule('actions').regenerateNotifications();
        gameCore.getModule('shop').regenerateNotifications();
        gameCore.getModule('courses').regenerateNotifications();
        gameCore.getModule('inventory').regenerateNotifications();
        gameCore.getModule('property').regenerateNotifications();
        gameCore.getModule('crafting').regenerateNotifications();
        gameCore.getModule('plantations').regenerateNotifications();
        gameCore.getModule('magic').regenerateNotifications();
        gameCore.getModule('guilds').regenerateNotifications();
    }

    /**
     * Повертає всі нові повідомлення для заданої категорії.
     * Якщо передано subcategory – фільтрує на 4-му рівні.
     */
    fetchCategoryNew(scope, category, subcategory = null) {
        const results = {};
        let target;
        if (subcategory !== undefined && subcategory !== null) {
            if (this.notifications[scope] && this.notifications[scope][category] && this.notifications[scope][category][subcategory]) {
                target = this.notifications[scope][category][subcategory];
            }
        } else {
            if (this.notifications[scope] && this.notifications[scope][category]) {
                target = this.notifications[scope][category];
            }
        }
        if (target) {
            for (const key in target) {
                if (target[key].isUnlocked && !target[key].isViewed) {
                    results[key] = true;
                }
            }
        }
        return results;
    }

    /**
     * Перевіряє, чи є нові повідомлення.
     * Аргументи scope, category, subcategory та id є необов'язковими, щоб фільтрувати результати.
     */
    hasNewNotifications(scope = null, category = null, subcategory = null, id = null) {
        const result = {};

        for (const scopeId in this.notifications) {
            if (scope && scopeId !== scope) {
                continue;
            }

            if (!result[scopeId]) {
                result[scopeId] = {
                    items: {},
                    hasNew: false,
                };
            }

            for (const categoryId in this.notifications[scopeId]) {
                if (category && categoryId !== category) {
                    continue;
                }

                if (!result[scopeId].items[categoryId]) {
                    result[scopeId].items[categoryId] = {
                        items: {},
                        hasNew: false,
                    };
                }

                // Перевіряємо, чи є в цій категорії підкатегорії
                const categoryData = this.notifications[scopeId][categoryId];

                if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
                    for (const subcategoryId in categoryData) {
                        if (subcategory && subcategoryId !== subcategory) {
                            continue;
                        }

                        if (!result[scopeId].items[categoryId].items[subcategoryId]) {
                            result[scopeId].items[categoryId].items[subcategoryId] = {
                                items: {},
                                hasNew: false,
                            };
                        }

                        const subcategoryData = categoryData[subcategoryId];

                        for (const itemId in subcategoryData) {
                            if (id && itemId !== id) {
                                continue;
                            }

                            const hasNew = subcategoryData[itemId].isUnlocked && !subcategoryData[itemId].isViewed;

                            if (hasNew) {
                                result[scopeId].items[categoryId].items[subcategoryId].items[itemId] = { hasNew: true };
                                result[scopeId].items[categoryId].items[subcategoryId].hasNew = true;
                                result[scopeId].items[categoryId].hasNew = true;
                                result[scopeId].hasNew = true;
                            }
                        }
                    }
                } else {
                    // Якщо підкатегорій немає, працюємо на рівні категорії
                    for (const itemId in categoryData) {
                        if (id && itemId !== id) {
                            continue;
                        }

                        const hasNew = categoryData[itemId].isUnlocked && !categoryData[itemId].isViewed;

                        if (hasNew) {
                            result[scopeId].items[categoryId].items[itemId] = { hasNew: true };
                            result[scopeId].items[categoryId].hasNew = true;
                            result[scopeId].hasNew = true;
                        }
                    }
                }
            }
        }

        return result;
    }


    /**
     * Відправляє нові повідомлення за допомогою eventHandler.
     */
    sendNewUnlocks(payload) {
        const result = this.hasNewNotifications(payload.scope, payload.category, payload.subcategory, payload.id);
        // console.log('NOTS: ', this.notifications, payload, result);
        let label = 'new-unlocks-notifications';
        if (payload.suffix) {
            label = `${label}-${payload.suffix}`;
        }
        this.eventHandler.sendData(label, result);
    }
}
