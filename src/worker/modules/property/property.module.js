import { gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerFurnitureStage1} from "./furniture-db";

export class PropertyModule extends GameModule {

    constructor() {
        super();
        this.purchasedFurnitures = {};
        this.isUnlocked = false;
        this.leveledId = null;
        this.eventHandler.registerHandler('purchase-furniture', (payload) => {
            this.purchaseFurniture(payload.id);
        })

        this.eventHandler.registerHandler('delete-furniture', (payload) => {
            this.deleteFurniture(payload.id);
        })
        
        this.eventHandler.registerHandler('query-furnitures-data', (payload) => {
            this.sendFurnituresData()
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

    }

    tick(game, delta) {
        this.leveledId = null;
    }

    save() {
        return {
            furnitures: this.purchasedFurnitures,
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
        this.sendFurnituresData();
    }

    reset() {
        this.load({});
    }

    setFurniture(furnitureId, amount, bForce = false) {
        gameEntity.setEntityLevel(furnitureId, amount, bForce);
        this.purchasedFurnitures[furnitureId] = gameEntity.getLevel(furnitureId);
    }

    purchaseFurniture(furnitureId) {
        const newEnt = gameEntity.levelUpEntity(furnitureId);
        console.log('newEntFurn: ', newEnt);
        if(newEnt.success) {
            this.purchasedFurnitures[furnitureId] = gameEntity.getLevel(furnitureId);
            this.leveledId = furnitureId;
            console.log('newEntFurnNEW: ', this.purchasedFurnitures)
            this.sendFurnituresData();
        }
        return newEnt.success;
    }

    deleteFurniture(furnitureId) {
        if(!this.purchasedFurnitures[furnitureId]) return;
        this.purchasedFurnitures[furnitureId]--;
        gameEntity.setEntityLevel(furnitureId, this.purchasedFurnitures[furnitureId]);
        this.sendFurnituresData();
    }

    getFurnituresData() {
        const entities = gameEntity.listEntitiesByTags(['furniture']);
        const spaceRes = gameResources.getResource('living_space');
        return {
            available: entities.filter(one => one.isUnlocked).map(entity => ({
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
            }
        }
    }

    sendFurnituresData() {
        const data = this.getFurnituresData();
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
            tags: entity.tags
        }
    }

    sendFurnitureDetails(id) {
        const data = this.getFurnitureDetails(id);
        this.eventHandler.sendData('furniture-details', data);
    }

}