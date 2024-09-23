import {GameModule} from "../../shared/game-module";
import { gameResources, gameEntity, gameCore, gameEffects } from "game-framework"

export class ResourcePoolModule extends GameModule {
    constructor() {
        super();
        this.dragonLevel = 0;
        this.dragonPower = 0;
        this.eventHandler.registerHandler('query-resources-data', () => {
            const data = this.getResourcesData();
            this.eventHandler.sendData('resources-data', data);
        })
    }

    initialize() {

        gameResources.registerResource('energy', {
            name: 'Energy',
            hasCap: true,
            tags: ['resource', 'energy', 'basic'],
            defaultCap: 0,
        })
        gameResources.registerResource('coins', {
            name: 'Coins',
            hasCap: true,
            tags: ['resource', 'coins', 'basic'],
            defaultCap: 1000,
        })

    }

    tick() {

    }

    save() {
        return {

        }
    }

    load(obj) {

    }

    reset() {
        const rs = gameResources.listResourcesByTags(['resource', 'population'], true);
        rs.forEach(r => {
            gameResources.setResource(r.id, 0);
        })
    }

    getResourcesData() {
        const rs = gameResources.listResourcesByTags(['resource', 'population'], true);
        return rs.filter(one => one.isUnlocked).map(resource => ({
            ...resource,
            isNegative: resource.balance < 0,
            isCapped: resource.amount >= resource.cap,
            eta: gameResources.assertToCapOrEmpty(resource.id),
            // affData: monitoredResources[resource.id] || undefined
        }))
    }
}