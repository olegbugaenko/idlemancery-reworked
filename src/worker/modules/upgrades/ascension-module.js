import { gameEntity, gameCore, gameEffects, gameResources, resourcesManager } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerAscensionUpgradesStage1} from "./ascension-upgrades-stage1-db";


export class AscensionModule extends GameModule {

    constructor() {
        super();
        this.activeUpgrades = {};
        this.numAscensions = 0;
        this.eventHandler.registerHandler('purchase-ascension-upgrade', (payload) => {
            this.purchaseUpgrade(payload.id);
        })
        this.eventHandler.registerHandler('query-ascension-upgrades-data', (payload) => {
            this.sendUpgradesData()
        })
        this.eventHandler.registerHandler('do-ascend', () => {
            this.doAscend();
        })
    }

    initialize() {

        registerAscensionUpgradesStage1();

    }

    tick(game, delta) {

    }

    save() {
        return {
            upgrades: this.activeUpgrades,
            numAscensions: this.numAscensions,
        }
    }

    load(saveObject) {
        this.activeUpgrades = {};
        if(saveObject?.upgrades) {
            for(const id in saveObject.upgrades) {
                this.setUpgrade(id, saveObject.upgrades[id]);
            }
        }
        this.numAscensions = saveObject?.numAscensions || 0;
        this.sendUpgradesData();
    }

    setUpgrade(upgradeId, amount) {
        gameEntity.setEntityLevel(upgradeId, amount);
        this.activeUpgrades[upgradeId] = gameEntity.getLevel(upgradeId);
    }

    purchaseUpgrade(upgradeId) {
        const newEnt = gameEntity.levelUpEntity(upgradeId);
        if(newEnt.success) {
            this.activeUpgrades[upgradeId] = gameEntity.getLevel(upgradeId);
            this.sendUpgradesData();
        }
        return newEnt.success;
    }

    getPotentialGains() {
        const gainPerDragonLevel = gameEntity.getLevel('dragon');
        const fromTerritory = gameEffects.getEffectValue('maxTerritory');
        const fromMegastructures = (gameEffects.getEffect('megastructuresMax')?.consumption || 0)*20;

        const breakDown = [{
            name: 'Dragon Level',
            value: gainPerDragonLevel
        },{
            name: 'Territory Revealed',
            value: fromTerritory
        }]

        if(fromMegastructures) {
            breakDown.push({
                name: 'Megastructures',
                value: fromMegastructures
            })
        }

        return {
            total: gainPerDragonLevel + fromTerritory + fromMegastructures,
            breakDown
        }
    }

    getUpgradesData() {
        const entities = gameEntity.listEntitiesByTags(['ascension']);
        const upgrades = entities.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.maxLevel || entity.getMaxLevel() || 0,
            level: this.activeUpgrades[entity.id] || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1)
        }))

        return {
            upgrades,
            ascension: {
                isUnlocked: gameEntity.getLevel('upgrade_ascension') > 0,
                potentialGains: this.getPotentialGains()
            }
        }
    }

    sendUpgradesData() {
        const data = this.getUpgradesData();
        this.eventHandler.sendData('ascension-upgrades-data', data);
    }

    doAscend() {
        const gain = this.getPotentialGains();
        gameCore.getModule('dragon').reset();
        gameCore.getModule('dragon-perks').reset();
        gameCore.getModule('upgrades').reset();
        gameCore.getModule('territory').reset();
        gameCore.getModule('buildings').reset();
        gameCore.getModule('population').reset();
        gameCore.getModule('supply').reset();
        gameCore.getModule('queue').reset();
        gameCore.getModule('army').reset();
        gameCore.getModule('conquer').reset();
        gameCore.getModule('resource-pool').reset();
        this.numAscensions++;
        gameResources.setResource('dragon-power', 0);
        gameResources.setResource('perks', 0);
        gameResources.addResource('dragon-egg', gain.total);
        resourcesManager.reassertAll();
        console.log('AP:', gameResources.resources, this.numAscensions);
        console.log('ENTS: ', Object.values(gameEntity.entities).filter(one => one.level > 0))
        this.sendUpgradesData();
    }

}