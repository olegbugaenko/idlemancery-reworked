import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerFurnitureStage1} from "./furniture-db";
import {registerAccessoriesStage1} from "./accessories-db";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";
import {cloneDeep} from "lodash";
import {registerAmplifiersStage1} from "./amplifiers-db";
import {charismaMod} from "../items/shop-db";

const DEFAULT_PROPERTY_FILTERS = {
    'all': {
        id: 'all',
        condition: '',
        rules: [],
        name: 'All',
        isRequired: true,
        isPinned: true,
        sortIndex: 0,
    },
    'resources': {
        id: 'resources',
        condition: '',
        rules: [{ type: 'tag', object: 'resource'}],
        name: 'Resources',
        isPinned: true,
        sortIndex: 1,
    },
    'storage': {
        id: 'storage',
        condition: '',
        rules: [{ type: 'tag', object: 'storage'}],
        name: 'Storage',
        isPinned: true,
        sortIndex: 2,
    }
}

const DEFAULT_ACCESSORY_FILTERS = {
    'all': {
        id: 'all',
        condition: '',
        rules: [],
        name: 'All',
        isRequired: true,
        isPinned: true,
        sortIndex: 0,
    },
    'resources': {
        id: 'resources',
        condition: '',
        rules: [{ type: 'tag', object: 'resource'}],
        name: 'Resources',
        isPinned: true,
        sortIndex: 1,
    },
    'storage': {
        id: 'storage',
        condition: '',
        rules: [{ type: 'tag', object: 'storage'}],
        name: 'Storage',
        isPinned: true,
        sortIndex: 2,
    },
    'actions-learning': {
        id: 'actions-learning',
        condition: '',
        rules: [{ type: 'tag', object: 'actions-learning'}],
        name: 'Actions Learning',
        isPinned: true,
        sortIndex: 3,
    }
}


const DEFAULT_AMPLIFIERS_FILTERS = {
    'all': {
        id: 'all',
        condition: '',
        rules: [],
        name: 'All',
        isRequired: true,
        isPinned: true,
        sortIndex: 0,
    },
    'earth': {
        id: 'earth',
        condition: '',
        rules: [{ type: 'tag', object: 'earth'}],
        name: 'Earth',
        isPinned: true,
        sortIndex: 1,
    },
    'water': {
        id: 'water',
        condition: '',
        rules: [{ type: 'tag', object: 'water'}],
        name: 'Water',
        isPinned: true,
        sortIndex: 2,
    },
    'air': {
        id: 'air',
        condition: '',
        rules: [{ type: 'tag', object: 'air'}],
        name: 'Air',
        isPinned: true,
        sortIndex: 3,
    },
}


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
            amplifier: {
                search: '',
                selectedScopes: ['name']
            }
        };
        this.autoPurchase = {};
        this.autoPurchaseCd = 0;
        this.customFilters = {
            furniture: cloneDeep(DEFAULT_PROPERTY_FILTERS),
            accessory: cloneDeep(DEFAULT_ACCESSORY_FILTERS),
            amplifier: cloneDeep(DEFAULT_AMPLIFIERS_FILTERS)
        };
        this.customFiltersOrder = {
            furniture: Object.keys(this.customFilters.furniture),
            accessory: Object.keys(this.customFilters.accessory),
            amplifier: Object.keys(this.customFilters.amplifier)
        };

        this.eventHandler.registerHandler('actions-change-custom-filters-order', payload => {
            //payload.sortIndex, payload.destinationIndex. Reorder this.customFiltersOrder
            const { sourceIndex, destinationIndex, filterId } = payload;

            // Захист від некоректних індексів:
            if (sourceIndex === undefined || destinationIndex === undefined) return;
            if (sourceIndex < 0 || destinationIndex < 0) return;
            if (sourceIndex >= this.customFiltersOrder[filterId].length || destinationIndex >= this.customFiltersOrder[filterId].length) return;

            // Копіюємо масив (якщо хочемо не мутувати оригінал),
            // але можна й "у місці" (mutable), залежно від вашої логіки
            const newOrder = [...this.customFiltersOrder[filterId]];

            // Вирізаємо елемент зі старої позиції
            const [removed] = newOrder.splice(sourceIndex, 1);
            // Ставимо на нову позицію
            newOrder.splice(destinationIndex, 0, removed);

            // Зберігаємо оновлений масив
            this.customFiltersOrder = newOrder;

            // console.log('Re-sorted', payload, newOrder);

            this.sendFurnituresData({filterId}, {
                searchData: this.searchData[filterId],
                hideMaxed: this.hideMaxed[payload.filterId] || false,
                selectedFilterId: this.selectedFilterId[payload.filterId],
            })
        })

        this.eventHandler.registerHandler('query-general-property-stats', (payload) => {
            this.sendGeneralPropetyStats(payload);
        })

        this.eventHandler.registerHandler('save-property-custom-filter', (payload) => {
            this.saveCustomFilter(payload);
        })

        this.eventHandler.registerHandler('delete-property-custom-filter', (payload) => {
            this.deleteCustomFilter(payload);
        })

        this.eventHandler.registerHandler('toggle-property-custom-filter-pinned', (payload) => {
            this.setCustomFilterPinned(payload);
        })

        this.eventHandler.registerHandler('apply-property-custom-filter', (payload) => {

            this.applyCustomFilter(payload);
        })

        this.eventHandler.registerHandler('set-furniture-autopurchase', ({ id, flag, filterId }) => {
            const entities = gameEntity.listEntitiesByTags([filterId]).filter(one => one.isUnlocked && !one.isCapped);
            entities.forEach(e => {
                if(!id || id === e.id) {
                    this.autoPurchase[e.id] = flag;
                }
            })
            this.sendFurnituresData({ filterId }, filterId ? {
                hideMaxed: this.hideMaxed[filterId] || false,
                searchData: this.searchData[filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                },
                selectedFilterId: this.selectedFilterId[filterId],
            } : undefined)
        })
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
            // console.log('Set Hide Maxed: ', payload);
            if(payload.filterId) {
                this.hideMaxed[payload.filterId] = payload.hideMaxed;
            }
            this.sendFurnituresData(payload, payload.filterId ? {
                hideMaxed: this.hideMaxed[payload.filterId] || false,
                selectedFilterId: this.selectedFilterId[payload.filterId],
                searchData: this.searchData[payload.filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                }
            } : undefined)
        })

        this.eventHandler.registerHandler('set-furniture-search-text', (payload) => {
            if(payload.filterId) {
                this.searchData[payload.filterId] = payload.searchData;
            }
            // console.log('sendFurniture: ', payload, this.searchData);
            this.sendFurnituresData(payload, payload.filterId ? {
                hideMaxed: this.hideMaxed[payload.filterId] || false,
                selectedFilterId: this.selectedFilterId[payload.filterId],
                searchData: this.searchData[payload.filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                }
            } : undefined)
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
                selectedFilterId: this.selectedFilterId[payload.filterId],
                searchData: this.searchData[payload.filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                }
            } : undefined)
        })

        this.eventHandler.registerHandler('query-furniture-details', (payload) => {
            this.sendFurnitureDetails(payload.id)
        })

        this.eventHandler.registerHandler('query-all-furniture-tags', (payload) => {
            this.sendAllFurnitureTags(payload)
        })

        this.eventHandler.registerHandler('query-all-accessory-tags', (payload) => {
            this.sendAllAccessoryTags(payload)
        })

        this.eventHandler.registerHandler('query-all-property-effects', (payload) => {
            this.sendAllFurnitureEffects(payload);
        })

        this.filtersCache = {
            furniture: {},
            accessory: {},
            amplifier: {},
        };
    }

    initialize() {

        gameResources.registerResource('living_space', {
            tags: ['living', 'secondary'],
            name: 'Living Space',
            isService: true,
            saveBalanceTree: true
        })

        registerFurnitureStage1();
        registerAccessoriesStage1();
        registerAmplifiersStage1();

    }

    /* Filters */

    generateFilterCache(filterId, id) {
        // console.log('generateFilterCache', filterId, id);
        if(!this.customFilters[filterId][id]) {
            delete this.filtersCache[filterId][id];
        }
        // now apply filters and find ids
        if(!this.customFilters[filterId][id].rules) {
            this.filtersCache[filterId][id] = {'all': true};
            return;
        }
        const entities = gameEntity.listEntitiesByTags([filterId]);

        this.filtersCache[filterId][id] = {};

        entities.forEach(entity => {
            const ruleResults = this.customFilters[filterId][id].rules.map(rule => {
                if(rule.type === 'tag') return entity.tags.includes(rule.object);
                if(rule.type === 'resource') return Object.keys(entity.modifier?.income?.resources || {}).includes(rule.object)
                    || Object.keys(entity.modifier?.multiplier?.resources || {}).includes(rule.object);
                if(rule.type === 'attribute') return Object.keys(entity.modifier?.income?.effects || {}).includes(rule.object)
                    || Object.keys(entity.modifier?.multiplier?.effects || {}).includes(rule.object);
                throw new Error('Invalid filter condition: '+rule.type);
            })


            if(id == '18828') {
                console.log('CHCK_ENT_RULES: ', id, entity.id, ruleResults, this.customFilters[filterId][id].condition, !this.customFilters[filterId][id].condition);
            }



            let conditionExpression = this.customFilters[filterId][id].condition;

            if(!conditionExpression) {
                const result = ruleResults.every(one => !!one);
                if(result) {
                    this.filtersCache[filterId][id][entity.id] = true;
                }
                return true;
            }

            ruleResults.forEach((result, index) => {
                conditionExpression = conditionExpression.replace(new RegExp(`\\b${index + 1}\\b`, 'g'), result);
            });

            conditionExpression = conditionExpression.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||').replace(/\bNOT\b/g, '!');

            if(id == '18828') {
                console.log('CHCK_ENT_RULES: ', id, conditionExpression, eval(conditionExpression));
            }

            try {
                const result = eval(conditionExpression);
                if(result) {
                    this.filtersCache[filterId][id][entity.id] = true;
                }
            } catch (error) {
                console.error("Invalid condition string", error);
                return false;
            }

        })

        // console.log('Generated Filter: ', this.filtersCache);

    }

    generateAllFiltersCache(filterId) {
        for(const id in this.customFilters[filterId]) {
            this.generateFilterCache(filterId, id);
        }
        // console.log('Caches: ', this.filtersCache[filterId]);
    }

    setCustomFilterPinned({ filterId, id, flag }) {
        if(this.customFilters[filterId][id]) {
            this.customFilters[filterId][id].isPinned = flag;
        }
    }

    saveCustomFilter(payload) {
        if(!payload.filterId) {
            throw new Error(`filterId is required!`)
        }
        let id = payload.id ?? `${Math.round(Math.random()*1000000)}`;

        this.customFilters[payload.filterId][id] = {...(this.customFilters[payload.filterId][id] || {}), ...payload, id};

        if(!payload.id) {
            this.customFiltersOrder[payload.filterId].push(id);
        }

        this.generateFilterCache(payload.filterId, id);

        //TODO: Re-index filters
        this.sendFurnituresData({ filterId: payload.filterId }, {
            hideMaxed: this.hideMaxed[payload.filterId] || false,
            searchData: this.searchData[payload.filterId]  || {
                search: '',
                selectedScopes: ['name']
            },
            selectedFilterId: this.selectedFilterId[payload.filterId],
        })
    }

    deleteCustomFilter({ filterId, id }) {
        const defaultFlt = filterId === 'furniture' ? DEFAULT_PROPERTY_FILTERS : DEFAULT_ACCESSORY_FILTERS;
        if(this.customFilters[filterId][id] && !defaultFlt[id]?.isRequired) {
            delete this.customFilters[filterId][id];
            this.customFiltersOrder[filterId] = this.customFiltersOrder[filterId].filter(fid => fid !== id);
            this.sendFurnituresData({ filterId }, {
                hideMaxed: this.hideMaxed[filterId] || false,
                searchData: this.searchData[filterId]  || {
                    search: '',
                    selectedScopes: ['name']
                },
                selectedFilterId: this.selectedFilterId[filterId],
            })
        }
    }

    applyCustomFilter({ filterId, id }) {
        this.selectedFilterId[filterId] = id;
        this.generateFilterCache(filterId, id);
        console.log('AppliedFilter: ', this.selectedFilterId);
        this.sendFurnituresData({ filterId }, {
            hideMaxed: this.hideMaxed[filterId] || false,
            searchData: this.searchData[filterId]  || {
                search: '',
                selectedScopes: ['name']
            },
            selectedFilterId: this.selectedFilterId[filterId],
        })
    }


    tick(game, delta) {
        this.leveledId = null;

        if(gameEntity.getLevel('shop_item_purchase_manager') > 0) {
            if(!this.autoPurchaseCd) {
                this.autoPurchaseCd = 10;
            }
            this.autoPurchaseCd -= delta;
            if(this.autoPurchaseCd <= 0) {
                this.autoPurchaseCd = 10;
                for(const key in this.autoPurchase) {
                    if(this.autoPurchase[key]) {
                        if(!gameEntity.isEntityUnlocked(key)) {
                            this.autoPurchase[key] = false;
                            console.log('Furniture '+key+' is locked. Toggling autopurchase');
                            continue;
                        }
                        if(gameEntity.isCapped(key)) {
                            this.autoPurchase[key] = false;
                            console.log('Furniture '+key+' is capped. Toggling autopurchase');
                            continue;
                        }
                        let cat = gameEntity.getEntity(key).tags?.includes('accessory') ? 'accessory' : (
                            gameEntity.getEntity(key).tags?.includes('furniture') ? 'furniture' : (
                                gameEntity.getEntity(key).tags?.includes('amplifier') ? 'amplifier' : null
                            )
                        )
                        const newEnt = this.purchaseFurniture(key, cat, {
                            isSilent: true,
                        });
                        // console.log('Purchase Auto Furniture: ', key, newEnt)
                        if(newEnt.success) {
                            return;
                        }
                    }
                }
            }
        }
    }

    save() {
        return {
            furnitures: this.purchasedFurnitures,
            hideMaxed: this.hideMaxed,
            searchData: this.searchData,
            autoPurchase: this.autoPurchase,
            customFilters: this.customFilters,
            customFiltersOrder: this.customFiltersOrder,
            selectedFilterId: this.selectedFilterId,
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
            amplifier: {
                search: '',
                selectedScopes: ['name']
            },
        };
        this.autoPurchase = {};
        if(saveObject?.autoPurchase) {
            this.autoPurchase = saveObject?.autoPurchase;
        }

        this.customFilters = {
            furniture: cloneDeep(DEFAULT_PROPERTY_FILTERS),
            accessory: cloneDeep(DEFAULT_ACCESSORY_FILTERS),
            amplifier: cloneDeep(DEFAULT_AMPLIFIERS_FILTERS)
        };
        this.customFiltersOrder = {
            furniture: Object.keys(this.customFilters.furniture),
            accessory: Object.keys(this.customFilters.accessory),
            amplifier: Object.keys(this.customFilters.amplifier)
        };
        this.selectedFilterId = {};
        if(saveObject?.customFilters) {
            for(const key in saveObject.customFilters) {
                if(!['furniture', 'accessory', 'amplifier'].includes(key)) {
                    delete saveObject.customFilters[key];
                }
            }
            for(const key in saveObject.customFiltersOrder) {
                if(!['furniture', 'accessory', 'amplifier'].includes(key)) {
                    delete saveObject.customFiltersOrder[key];
                }
            }
            this.customFilters = {
                ...this.customFilters,
                ...saveObject?.customFilters
            };
            // check if all required are prestnt
            for(const key in this.customFilters) {
                let isValid = true;
                const keyMap = {
                    'furniture': DEFAULT_PROPERTY_FILTERS,
                    'accessory': DEFAULT_ACCESSORY_FILTERS,
                    'amplifier': DEFAULT_AMPLIFIERS_FILTERS,
                }
                const defFlt = keyMap[key];
                for(const fltId in defFlt) {
                    if(defFlt[fltId].isRequired && !this.customFilters[key][fltId]) {
                        isValid = false;
                        break;
                    }
                }
                if(!isValid) {
                    this.customFilters = cloneDeep(defFlt);
                    this.selectedFilterId[key] = 'all';
                } else {
                    this.selectedFilterId[key] = saveObject?.selectedFilterId?.[key] ?? 'all';
                }
            }

        }
        // console.log('CustomFilters: ', this.customFilters);
        for(const key in this.customFilters) {
            this.generateAllFiltersCache(key);
        }
        if(saveObject?.customFiltersOrder) {
            this.customFiltersOrder = {
                furniture: Object.keys(this.customFilters.furniture),
                accessory: Object.keys(this.customFilters.accessory),
                amplifier: Object.keys(this.customFilters.amplifier),
                ...saveObject.customFiltersOrder
            };
        } else {
            this.customFiltersOrder = {
                furniture: Object.keys(this.customFilters.furniture),
                accessory: Object.keys(this.customFilters.accessory),
                amplifier: Object.keys(this.customFilters.amplifier)
            };
        }

        /*this.sendFurnituresData({ filterId: 'furniture' }, {
            searchData: this.searchData,
        });*/
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
        // console.log('newEntFurn: ', newEnt);
        if(newEnt.success) {
            this.purchasedFurnitures[furnitureId] = gameEntity.getLevel(furnitureId);
            this.leveledId = furnitureId;
            if(!options?.isSilent) {
                // console.log('newEntFurnNEW: ', this.purchasedFurnitures)
                gameCore.getModule('unlock-notifications').generateNotifications();
                this.sendFurnituresData({ filterId }, options);
            }
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

        ['furniture', 'accessory', 'amplifier'].forEach(filter => {
            // const items = gameEntity.listEntitiesByTags([filter]);
            Object.values(this.customFilters[filter]).forEach(filterData => {
                const items = gameEntity.listEntitiesByTags([filter]).filter(one => this.filtersCache[filter][filterData.id][one.id]);
                items.forEach(item => {
                    gameCore.getModule('unlock-notifications').registerNewNotification(
                        'property',
                        filter,
                        filterData.id,
                        item.id,
                        item.isUnlocked && !item.isCapped
                    )
                })
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

        if(selectedScopes.includes('resources') && one.searchableMeta?.['resources']
            && one.searchableMeta?.['resources'].some(tag => tag.includes(search.toLowerCase()))) return true;
        if(selectedScopes.includes('effects') && one.searchableMeta?.['effects']
            && one.searchableMeta?.['effects'].some(tag => tag.includes(search.toLowerCase()))) return true;

        return false;
    }

    getFurnituresData(payload, options) {
        if(!payload.filterId) {
            throw new Error('filter is required here');
        }
        //const entities = gameEntity.listEntitiesByTags([payload.filterId]);
        // console.log('FLTS: ', payload.filterId, this.customFilters, this.selectedFilterId);

        if(!this.selectedFilterId[payload.filterId] || !this.customFilters[payload.filterId][this.selectedFilterId[payload.filterId]]) {
            this.selectedFilterId[payload.filterId] = 'all';
        }
        // const entities = gameEntity.listEntitiesByTags(['action']).filter(one => one.isUnlocked && !one.isCapped);
        const perCats = Object.values(this.customFilters[payload.filterId]).reduce((acc, filter) => {

            acc[filter.id] = {
                id: filter.id,
                name: filter.name,
                rules: filter.rules,
                isPinned: filter.isPinned,
                sortIndex: this.customFiltersOrder[payload.filterId].findIndex(s => s === filter.id),
                items: gameEntity.listEntitiesByTags([payload.filterId])
                    .filter(one => this.filtersCache[payload.filterId][filter.id][one.id] && one.isUnlocked
                        && (!options?.hideMaxed || !one.isCapped)
                        && !one.isUnpurchaseable
                        && this.matchSearch(one, options.searchData)
                    ),
                isSelected: this.selectedFilterId[payload.filterId] === filter.id
            }

            return acc;
        }, {})


        const entities = perCats[this.selectedFilterId[payload.filterId]].items;

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
                isAutoPurchase: this.autoPurchase[entity.id] ?? false,
                spaceUsage: gameEntity.getEffects(entity.id, 1).find(one => one.id === 'living_space')?.value / Math.max(1, spaceRes.consumption)
            })),
            propertyCategories: Object.values(perCats).filter(cat => cat.items.length > 0).sort((a, b) => a.sortIndex - b.sortIndex),
            space: {
                max: spaceRes.income * spaceRes.multiplier,
                consumption: spaceRes.consumption,
                total: spaceRes.amount,
                breakDown: spaceRes.breakDown
            },
            selectedCategory: this.selectedFilterId[payload.filterId],
            searchData: options?.searchData,
            hideMaxed: options?.hideMaxed,
            isAutomationUnlocked: gameEntity.getLevel('shop_item_purchase_manager') > 0,
            customFilters: this.customFilters[payload.filterId],
            customFiltersOrder: this.customFiltersOrder[payload.filterId],
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

    getAllItemsTags(filterId) {
        const allActions = gameEntity.listEntitiesByTags([filterId]);

        const tagsByUnlocks = {};

        allActions.forEach(a => {
            a.tags.forEach(tag => {
                tagsByUnlocks[tag] = {
                    id: tag,
                    name: tag,
                    isUnlocked: tagsByUnlocks[tag]?.isUnlocked || (a.isUnlocked && !a.isCapped)
                }
            })
        })

        return Object.values(tagsByUnlocks);

    }

    sendAllFurnitureTags(payload) {
        const data = this.getAllItemsTags('furniture');
        let label = 'all-furniture-tags';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }

    sendAllAccessoryTags(payload) {
        const data = this.getAllItemsTags('accessory');
        let label = 'all-accessory-tags';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }

    getAllFurnitureEffects(filterId) {
        const propertyEntities = gameEntity.listEntitiesByTags([filterId]);
        const effectIdsUnique = propertyEntities.reduce((acc, entity) => {
            const incomes = Object.keys(entity.modifier?.income?.effects || {});
            const effects = Object.keys(entity.modifier?.multiplier?.effects || {});
            const newAcc = acc;
            [...incomes, ...effects].forEach(key => {
                newAcc[key] = newAcc[key] || entity.isUnlocked;
            })
            return newAcc;
        }, {});
        const list = [];
        for(const key in effectIdsUnique) {
            list.push({
                ...gameEffects.getEffect(key),
                isUnlocked: effectIdsUnique[key] && gameEffects.isEffectUnlocked(key)
            })
        }

        return list;
    }

    sendAllFurnitureEffects(payload) {
        const data = this.getAllFurnitureEffects(payload.filterId);
        let label = 'all-property-effects';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }

    getGeneraPropertyStatsData() {

        const shopStats = [];
        if(Math.abs(gameEffects.getEffectValue('prices_discount') - 1) > SMALL_NUMBER) {
            shopStats.push({...gameEffects.getEffect('prices_discount'), isMultiplier: true});
        }
        if(Math.abs(charismaMod(gameEffects.getEffectValue('attribute_charisma')) - 1) > SMALL_NUMBER) {
            shopStats.push({
                name: 'Charisma Price Discount',
                description: 'Upgrades and items purchase discount based on your charisma attribute (1./(1 + 0.02*log2(charisma)^2))',
                value: charismaMod(gameEffects.getEffectValue('attribute_charisma'))
            })
        }

        const stats = {
            'property': [
                ...shopStats,
            ].filter(one => !one.isMultiplier || Math.abs(one.value - 1) > SMALL_NUMBER),
            'accessories': [],
            'amplifiers': [
                /*{...gameEffects.getEffect('restoration_spells_efficiency'), isMultiplier: true},
                {...gameEffects.getEffect('recovery_spells_efficiency'), isMultiplier: true},
                {...gameEffects.getEffect('illusion_spells_efficiency'), isMultiplier: true},
                {...gameEffects.getEffect('conjuration_spells_efficiency'), isMultiplier: true},
                {...gameEffects.getEffect('elemental_spells_efficiency'), isMultiplier: true},*/
            ].filter(one => !one.isMultiplier || Math.abs(one.value - 1) > SMALL_NUMBER)
        }
        return stats;
    }

    sendGeneralPropetyStats(payload) {
        const data = this.getGeneraPropertyStatsData();
        let label = 'general-property-stats';
        if(payload?.prefix) {
            label = `${label}-${payload?.prefix}`
        }
        this.eventHandler.sendData(label, data);
    }

}