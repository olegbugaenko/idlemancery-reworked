import { gameEntity, gameResources } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerUpgradesStage1} from "./upgrades-stage1-db";
import {registerUpgradesStage2} from "./upgrades-stage2-db";
import {upgradesStage3Db} from "./upgrades-stage3-db";

export class UpgradesModule extends GameModule {

    constructor() {
        super();
        this.activeUpgrades = {};
        this.eventHandler.registerHandler('monitor-upgrade', (payload) => {
            this.setUpgradeMonitor(payload.id, payload.reset);
        })
        this.eventHandler.registerHandler('purchase-upgrade', (payload) => {
            this.purchaseUpgrade(payload.id);
        })
        this.eventHandler.registerHandler('query-upgrades-data', (payload) => {
            this.sendUpgradesData()
        })
    }

    initialize() {

        registerUpgradesStage1();
        registerUpgradesStage2();
        upgradesStage3Db();

    }

    tick(game, delta) {

    }

    save() {
        return {
            upgrades: this.activeUpgrades,
        }
    }

    load(saveObject) {
        for(const key in this.activeUpgrades) {
            this.setUpgrade(key, 0, true);
        }
        this.activeUpgrades = {};
        if(saveObject?.upgrades) {
            for(const id in saveObject.upgrades) {
                this.setUpgrade(id, saveObject.upgrades[id], true);
            }
        }
        this.sendUpgradesData();
    }

    reset() {
        this.load({});
    }

    setUpgrade(upgradeId, amount, bForce = false) {
        gameEntity.setEntityLevel(upgradeId, amount, bForce);
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

    getUpgradesData() {
        const entities = gameEntity.listEntitiesByTags(['upgrade']);
        return entities.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: entity.maxLevel || entity.getMaxLevel() || 0,
            level: this.activeUpgrades[entity.id] || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1)
        }))
    }

    sendUpgradesData() {
        const data = this.getUpgradesData();
        this.eventHandler.sendData('upgrades-data', data);
    }

    setUpgradeMonitor(id, reset = false) {
        if(reset) {
            this.entityMonitorId = null;
            return;
        }
        this.entityMonitorId = id;
    }

    getEntityMonitored() {
        if(!this.entityMonitorId) return null;
        const entity = gameEntity.entities[this.entityMonitorId];
        if(!entity) return null;
        return {
            ...entity,
            affordable: gameEntity.getAffordable(this.entityMonitorId),
            potentialEffects: gameEntity.getEffects(this.entityMonitorId, 1),
            currentEffects: gameEntity.getEffects(this.entityMonitorId, 0),
            max: entity.maxLevel || (entity.getMaxLevel ? entity.getMaxLevel() : 0),
        }
    }

}