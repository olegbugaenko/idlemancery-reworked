import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerFurnitureStage1} from "./furniture-db";
import {registerAccessoriesStage1} from "./accessories-db";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class PropertyModule extends GameModule {

    constructor() {
        super();
        this.purchasedFurnitures = {};
        this.isUnlocked = false;
        this.leveledId = null;
        this.hideMaxed = {};
        this.searchData = {
            furniture: {
                search: '',
                selectedScopes: ['name']
            },
            accessory: {
                search: '',
                selectedScopes: ['name']
            },
        };
        this.eventHandler.registerHandler('purchase-furniture', (payload) => {
            this.purchaseFurniture(payload.id, payload.filterId, payload.filterId ? {
                hideMaxed: this.hideMaxed[payload.filterId] || false,
                searchData: this.searchData[payload.filterId] || {
                    search: '',
                    selectedScopes: ['name']
                }
            } : undefined);
        })

        this.eventHandler.registerHandler('set-furniture-hide-maxed', (payload) => {
            if(payload.filterId) {
                this.hideMaxed[payload.filterId] = payload.hideMaxed;
            }
        })

        this.eventHandler.registerHandler('set-furniture-search-text', (payload) => {
            if(payload.filterId) {
                this.searchData[payload.filterId] = payload.searchData;
            }
            console.log('sendFurniture: ', payload, this.searchData);
        })

        this.eventHandler.registerHandler('delete-furniture', (payload) => {
            this.deleteFurniture(payload.id, payload.filterId, payload.filterId ? {
                hideMaxed: this.hideMaxed[payload.filterId] || false,
                searchData: this.searchData[payload.filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                }
            } : undefined);
        })
        
        this.eventHandler.registerHandler('query-furnitures-data', (payload) => {

            this.sendFurnituresData(payload, payload.filterId ? {
                hideMaxed: this.hideMaxed[payload.filterId] || false,
                searchData: this.searchData[payload.filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                }
            } : undefined)
        })

        this.eventHandler.registerHandler('query-furniture-details', (payload) => {
            this.sendFurnitureDetails(payload.id)
        })
        
    }

    initialize() {

        gameResources.registerResource('living_space', {
            tags: ['living', 'secondary'],
            name: 'Living Space',
            isService: true,
        })

        gameEffects.registerEffect('urn_storage_bonus', {
            name: 'Urns storage bonus',
            defaultValue: 1.,
            minValue: 1,
            hasCap: false,
        })

        registerFurnitureStage1();
        registerAccessoriesStage1();

    }

    tick(game, delta) {
        this.leveledId = null;
    }

    save() {
        return {
            furnitures: this.purchasedFurnitures,
            hideMaxed: this.hideMaxed,
            searchData: this.searchData,
        }
    }

    load(saveObject) {
        for(const key in this.purchasedFurnitures) {
            this.setFurniture(key, 0, true);
        }
        this.purchasedFurnitures = {};
        if(saveObject?.furnitures) {
            for(const id in saveObject.furnitures) {
                this.setFurniture(id, saveObject.furnitures[id], true);
            }
        }
        this.isUnlocked = saveObject?.isUnlocked || false;
        this.hideMaxed = saveObject?.hideMaxed || {};
        this.searchData = saveObject?.searchData || {
            furniture: {
                search: '',
                selectedScopes: ['name']
            },
            accessory: {
                search: '',
                selectedScopes: ['name']
            },
        };
        this.sendFurnituresData({ filterId: 'furniture' });
    }

    reset() {
        this.load({});
    }

    setFurniture(furnitureId, amount, bForce = false) {
        gameEntity.setEntityLevel(furnitureId, amount, bForce);
        this.purchasedFurnitures[furnitureId] = gameEntity.getLevel(furnitureId);
    }

    purchaseFurniture(furnitureId, filterId, options) {
        const newEnt = gameEntity.levelUpEntity(furnitureId);
        console.log('newEntFurn: ', newEnt);
        if(newEnt.success) {
            this.purchasedFurnitures[furnitureId] = gameEntity.getLevel(furnitureId);
            this.leveledId = furnitureId;
            console.log('newEntFurnNEW: ', this.purchasedFurnitures)
            gameCore.getModule('unlock-notifications').generateNotifications();
            this.sendFurnituresData({ filterId }, options);
        }
        return newEnt.success;
    }

    deleteFurniture(furnitureId, filterId, options) {
        if(!this.purchasedFurnitures[furnitureId]) return;
        this.purchasedFurnitures[furnitureId]--;
        gameEntity.setEntityLevel(furnitureId, this.purchasedFurnitures[furnitureId]);
        gameCore.getModule('unlock-notifications').generateNotifications();
        this.sendFurnituresData({ filterId }, options);
    }

    regenerateNotifications() {

        ['furniture', 'accessory'].forEach(filter => {
            const items = gameEntity.listEntitiesByTags([filter]);
            items.forEach(item => {
                gameCore.getModule('unlock-notifications').registerNewNotification(
                    'property',
                    filter,
                    item.id,
                    item.isUnlocked && !item.isCapped
                )
            })
        })
    }

    matchSearch(one, searchData) {
        if(!searchData) return true;
        const { search, selectedScopes } = searchData;
        if(!search) return true;
        if(selectedScopes.includes('name') && one.name.toLowerCase().includes(search)) return true;
        if(selectedScopes.includes('tags') && one.tags && one.tags.some(tag => tag.includes(search))) return true;
        if(selectedScopes.includes('description') && one.description && one.description.toLowerCase().includes(search)) return true;

        return false;
    }

    getFurnituresData(payload, options) {
        if(!payload.filterId) {
            throw new Error('filter is required here');
        }
        const entities = gameEntity.listEntitiesByTags([payload.filterId]);
        const spaceRes = gameResources.getResource('living_space');

        return {
            available: entities.filter(one => one.isUnlocked
                && (!options?.hideMaxed || !one.isCapped)
                && this.matchSearch(one, options?.searchData)
            ).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id),
                level: this.purchasedFurnitures[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id,
                isCapped: entity.isCapped,
            })),
            space: {
                max: spaceRes.income * spaceRes.multiplier,
                consumption: spaceRes.consumption,
                total: spaceRes.amount,
            },
            searchData: options?.searchData,
            hideMaxed: options?.hideMaxed
        }
    }

    sendFurnituresData(payload, options) {
        const data = this.getFurnituresData(payload, options);
        this.eventHandler.sendData('furnitures-data', data);
    }

    getFurnitureDetails(id) {
        if(!id) return null;
        const entity = gameEntity.getEntity(id);
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: gameEntity.getEntityMaxLevel(entity.id),
            level: this.purchasedFurnitures[entity.id] || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1),
            currentEffects: gameEntity.getEffects(entity.id),
            tags: entity.tags
        }
    }

    sendFurnitureDetails(id) {
        const data = this.getFurnitureDetails(id);
        this.eventHandler.sendData('furniture-details', data);
    }

}