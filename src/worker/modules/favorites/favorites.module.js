import {GameModule} from "../../shared/game-module";
import { gameCore } from "game-framework/"

export class FavoritesModule extends GameModule {

    constructor() {
        super();
        
        this.favorites = {
            actions: {},
            actionLists: {},
            craftingLists: {},
            alchemyLists: {},
            courses: {}
        };

        this.eventHandler.registerHandler('add-favorite', (payload) => {
            this.addFavorite(payload.type, payload.id);
        });

        this.eventHandler.registerHandler('remove-favorite', (payload) => {
            this.removeFavorite(payload.type, payload.id);
        });

        this.eventHandler.registerHandler('query-favorites', (payload) => {
            this.sendFavorites();
        });

        this.eventHandler.registerHandler('query-favorite-items', (payload) => {
            this.getFavoritesData();
        });

        this.eventHandler.registerHandler('toggle-favorite', (payload) => {
            this.toggleFavorite(payload.type, payload.id);
        });
    }

    initialize() {
        // Initialize favorites module
    }

    addFavorite(type, id) {
        if (!this.favorites[type]) {
            this.favorites[type] = {};
        }
        
        if (!this.favorites[type][id]) {
            this.favorites[type][id] = true;
            this.sendFavorites();
        }
    }

    removeFavorite(type, id) {
        if (this.favorites[type] && this.favorites[type][id]) {
            delete this.favorites[type][id];
            this.sendFavorites();
        }
    }

    toggleFavorite(type, id) {
        if (this.isFavorite(type, id)) {
            this.removeFavorite(type, id);
        } else {
            this.addFavorite(type, id);
        }
    }

    isFavorite(type, id) {
        return this.favorites[type] && this.favorites[type][id];
    }

    sendFavorites() {
        // Convert objects to arrays for backward compatibility
        const favoritesArray = {
            actions: Object.keys(this.favorites.actions),
            actionLists: Object.keys(this.favorites.actionLists),
            craftingLists: Object.keys(this.favorites.craftingLists),
            alchemyLists: Object.keys(this.favorites.alchemyLists),
            courses: Object.keys(this.favorites.courses)
        };
        this.eventHandler.sendData('favorites', favoritesArray);
    }

    getFavoritesData() {
        const favoriteItems = {
            actions: {},
            actionLists: {},
            craftingLists: {},
            alchemyLists: {},
            courses: {}
        };

        // Get favorite actions data
        const actionsModule = gameCore.getModule('actions');
        if (actionsModule) {
            const actionsData = actionsModule.getActionsData('all', {}).available;
            actionsData.forEach(action => {
                if (action.isFavorite) {
                    favoriteItems.actions[action.id] = action;
                }
            });
        }

        // Get favorite action lists data
        if (actionsModule && actionsModule.lists) {
            const listsData = actionsModule.lists.getLists({});
            listsData.forEach(list => {
                if (list.isFavorite) {
                    favoriteItems.actionLists[list.id] = list;
                }
            });
        }

        // Get favorite crafting lists data
        const craftingModule = gameCore.getModule('crafting');
        if (craftingModule && craftingModule.lists) {
            const craftingListsData = craftingModule.lists.getLists({ category: 'crafting' }).lists;
            craftingListsData.forEach(list => {
                if (list.isFavorite) {
                    favoriteItems.craftingLists[list.id] = list;
                }
            });
        }

        // Get favorite alchemy lists data
        if (craftingModule && craftingModule.lists) {
            const alchemyListsData = craftingModule.lists.getLists({ category: 'alchemy' }).lists;
            alchemyListsData.forEach(list => {
                if (list.isFavorite) {
                    favoriteItems.alchemyLists[list.id] = list;
                }
            });
        }

        // Get favorite courses data
        const coursesModule = gameCore.getModule('courses');
        if (coursesModule) {
            const coursesData = coursesModule.getItemsData().available;
            coursesData.forEach(course => {
                if (course.isFavorite) {
                    favoriteItems.courses[course.id] = course;
                }
            });
        }

        this.eventHandler.sendData('favorite-items', favoriteItems);
    }

    save() {
        return {
            favorites: this.favorites
        };
    }

    load(saveObject) {
        if (saveObject?.favorites) {
            // Handle both old array format and new object format
            if (Array.isArray(saveObject.favorites.actions)) {
                // Convert old array format to new object format
                this.favorites = {
                    actions: saveObject.favorites.actions.reduce((acc, id) => { acc[id] = true; return acc; }, {}),
                    actionLists: saveObject.favorites.actionLists.reduce((acc, id) => { acc[id] = true; return acc; }, {}),
                    craftingLists: saveObject.favorites.craftingLists.reduce((acc, id) => { acc[id] = true; return acc; }, {}),
                    alchemyLists: saveObject.favorites.alchemyLists.reduce((acc, id) => { acc[id] = true; return acc; }, {}),
                    courses: saveObject.favorites.courses.reduce((acc, id) => { acc[id] = true; return acc; }, {})
                };
            } else {
                this.favorites = saveObject.favorites;
            }
        }
    }

    tick() {
        // No tick logic needed for favorites
    }
} 