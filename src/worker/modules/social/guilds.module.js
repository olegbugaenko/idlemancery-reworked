import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {registerGuilds} from "./guilds-db";
import {registerGuildUpgrades} from "./guild-upgrades-db";
import {packEffects} from "../../shared/utils/objects";

export class GuildsModule extends GameModule {

    constructor() {
        super();
        this.purchasedUpgrades = {};
        this.guildsStats = {};
        this.selectedGuild = null;
        this.leveledId = null;
        this.eventHandler.registerHandler('select-guild', (payload) => {
            this.selectGuild(payload.id);
        })
        this.eventHandler.registerHandler('leave-guild', (payload) => {
            this.leaveGuild(payload.id);
        })
        this.eventHandler.registerHandler('purchase-guild-item', (payload) => {
            this.purchaseItem(payload.id);
        })
        this.eventHandler.registerHandler('query-guild-items-data', (payload) => {
            this.sendItemsData()
        })

        this.eventHandler.registerHandler('query-guild-item-details', (payload) => {
            this.sendItemDetails(payload.id, payload.meta)
        })

    }

    initialize() {

        gameEffects.registerEffect('guild_reputation_rate', {
            name: 'Guild Reputation Rate',
            defaultValue: 1,
            minValue: 1
        })

        gameResources.registerResource('guild_reputation', {
            name: 'Guild Reputation',
            hasCap: true,
            tags: ['guild', 'reputation'],
            defaultCap: 0,
        })

        gameResources.registerResource('guild-points', {
            name: 'Guild Points',
            hasCap: true,
            tags: ['guild', 'points'],
            defaultCap: 0,
            isService: true,
        })

        registerGuilds();
        registerGuildUpgrades();

    }

    leaveGuild() {
        if(!this.selectedGuild) {
            return;
        }
        //
        if(!this.guildsStats) {
            this.guildsStats = {};
        }
        if(!this.guildsStats[this.selectedGuild]) {
            this.guildsStats[this.selectedGuild] = {
                maxLevel: 0,
            }
        }
        this.guildsStats[this.selectedGuild].maxLevel = Math.max(this.guildsStats[this.selectedGuild].maxLevel, gameEntity.getLevel(this.selectedGuild));
        for(const key in this.purchasedUpgrades) {
            this.setItem(key, 0, true);
        }
        this.purchasedUpgrades = {};
        gameEntity.setEntityLevel(this.selectedGuild, 0, true);
        gameResources.setResource('guild_reputation', 0);
        /*gameEntity.listEntitiesByTags(['action', 'guild-activity']).map(a => {
            gameCore.getModule('actions').setAction(a.id, 1, true);
            if(gameCore.getModule('actions').actions[a.id]) {
                gameCore.getModule('actions').actions[a.id].xp = 0;
            }
        })*/
        this.setPermaBonus(this.selectedGuild, this.guildsStats[this.selectedGuild].maxLevel, true);

        gameCore.getModule('unlock-notifications').generateNotifications();

        // handle perma guild bonus
        this.selectedGuild = null;
    }

    selectGuild(id) {
        this.selectedGuild = id;
        gameEntity.setEntityLevel(this.selectedGuild, 1, true);
        gameCore.getModule('unlock-notifications').generateNotifications();
        gameResources.setResource('guild_reputation', 0);
    }

    getPotentialPermaLevel(id) {
        const cl = this.selectedGuild === id ? gameEntity.getLevel(this.selectedGuild) : this.guildsStats[id].maxLevel;
        return Math.max(0, cl - 1);
    }

    getCurrentPermaLevel(id) {
        const cl = this.guildsStats[id]?.maxLevel || 0;
        return Math.max(0, cl - 1);
    }

    getCurrentActualPermaLevel(id) {
        const ent = gameEntity.getAttribute(id, 'permaBonusId');
        const relLevel = gameEntity.getLevel(ent);
        return relLevel;
    }

    setPermaBonus(id, level, bForce = false) {
        const ent = gameEntity.getAttribute(id, 'permaBonusId');
        console.log('Setting: ', id, ent, level);
        gameEntity.setEntityLevel(ent, level, bForce);
    }

    tick(game, delta) {
        this.leveledId = null;
        if(!this.selectedGuild) return;

        const guild = gameEntity.getLevel(this.selectedGuild);

        const rs = gameResources.getResource('guild_reputation');
        if(rs.amount >= rs.cap) {
            const rslt = gameEntity.levelUpEntity(this.selectedGuild);
            // gameResources.addResource('guild-points', 1);
            this.isLeveledUp = true;

            gameCore.getModule('unlock-notifications').setViewedById(
                `guild_leveled`,
                false
            )
            // const data = this.getMageData();
            // this.eventHandler.sendData('mage-data', data);
        }
    }

    save() {
        return {
            selectedGuild: this.selectedGuild,
            guildLevel: this.selectedGuild ? gameEntity.getLevel(this.selectedGuild) : 0,
            purchasedUpgrades: this.purchasedUpgrades,
            guildsStats: this.guildsStats,
        }
    }

    load(obj) {
        if(this.selectedGuild) {
            gameEntity.setEntityLevel(this.selectedGuild, 0, true);
        }

        this.selectedGuild = obj?.selectedGuild;
        if(this.selectedGuild) {
            gameEntity.setEntityLevel(this.selectedGuild, obj?.guildLevel);
        }

        for(const key in this.purchasedUpgrades) {
            this.setItem(key, 0, true);
        }
        this.purchasedUpgrades = {};
        if(obj?.purchasedUpgrades) {
            for(const id in obj.purchasedUpgrades) {
                this.setItem(id, obj.purchasedUpgrades[id], true);
            }
        }

        if(this.guildsStats) {
            for(const key in this.guildsStats) {
                this.guildsStats[key].maxLevel = 0;
                this.setPermaBonus(key, 0, true);
            }
        }

        if(obj?.guildsStats) {
            this.guildsStats = obj?.guildsStats;
            for(const key in this.guildsStats) {
                this.setPermaBonus(key, this.getCurrentPermaLevel(key), true)
            }
        }

        this.sendItemsData();
    }

    reset() {
        this.load({});
    }

    setItem(itemId, amount, bForce = false) {
        gameEntity.setEntityLevel(itemId, amount, bForce);
        this.purchasedUpgrades[itemId] = gameEntity.getLevel(itemId);
    }

    purchaseItem(itemId) {
        const newEnt = gameEntity.levelUpEntity(itemId);
        console.log('Purchase Guild Upgrade: ', newEnt)
        if(newEnt.success) {
            this.purchasedUpgrades[itemId] = gameEntity.getLevel(itemId);
            this.leveledId = itemId;
            this.sendItemsData();
        }
        return newEnt.success;
    }

    regenerateNotifications() {
        gameCore.getModule('unlock-notifications').registerNewNotification(
            'social',
            'guilds',
            `no_guild_selected`,
            !this.selectedGuild
        )

        gameCore.getModule('unlock-notifications').registerNewNotification(
            'social',
            'guilds',
            `guild_leveled`,
            this.selectedGuild && gameEntity.getLevel(this.selectedGuild) > 0
        )
    }

    getItemsData() {
        const guilds = gameEntity.listEntitiesByTags(['guild']).map(one => ({
            ...one,
            icon_id: one.attributes.icon_id,
        }));
        const current = this.selectedGuild ? guilds.find(g => g.id === this.selectedGuild) : undefined;
        const upgrades = gameEntity.listEntitiesByTags(['guild-upgrade']);
        const cLv = this.selectedGuild ? gameEntity.getLevel(this.selectedGuild) : 0
        return {
            guilds,
            current,
            availableUpgrades: upgrades.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id),
                level: this.purchasedUpgrades[entity.id] || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id,
                tier: entity.attributes.tier,
            })).reduce((acc, upgrade) => {
                // Check if the tier already exists in the accumulator
                if (!acc[upgrade.tier-1]) {
                    acc[upgrade.tier-1] = []; // Initialize the tier as an empty array
                }
                acc[upgrade.tier-1].push(upgrade); // Add the upgrade to the corresponding tier
                return acc;
            }, { 0: [], 1: [], 2: []}),
            tierUnlocks: [1,5,10].map(c => ({
                isUnlocked: c <= cLv,
                level: c,
            })),
            points: gameResources.getResource('guild-points'),
            reputation: {
                ...gameResources.getResource('guild_reputation'),
                eta: gameResources.assertToCapOrEmpty('guild_reputation')
            },
            maxLevel: this.selectedGuild ? this.guildsStats[this.selectedGuild]?.maxLevel || 1 : 1,
            prestige: this.selectedGuild ? {
                canPrestige: this.getPotentialPermaLevel(this.selectedGuild) > this.getCurrentActualPermaLevel(this.selectedGuild),
                currentEffects: packEffects(
                    gameEntity.getEffects(current.attributes.permaBonusId)
                ),
                potentialEffects: packEffects(
                    gameEntity.getEffects(current.attributes.permaBonusId, 0, this.getPotentialPermaLevel(this.selectedGuild))
                )
            } : null,
        }
    }

    sendItemsData() {
        const data = this.getItemsData();
        this.eventHandler.sendData('guild-items-data', data);
    }

    getItemDetails(id, meta) {
        if(!id) return null;
        const entity = gameEntity.getEntity(id);
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: gameEntity.getEntityMaxLevel(entity.id),
            level: this.purchasedUpgrades[entity.id] || 0,
            affordable: meta === 'guild' ? undefined : gameEntity.getAffordable(entity.id),
            potentialEffects: meta === 'guild' ? undefined : gameEntity.getEffects(entity.id, 1),
            effects: meta === 'guild' ? gameEntity.getEffects(entity.id, 1).filter(one => one.id !== 'guild_reputation') : undefined,
            currentEffects: meta === 'guild' ? undefined : gameEntity.getEffects(entity.id),
            tags: entity.tags,
            purchaseMultiplier: 1,
        }
    }

    sendItemDetails(id, meta) {
        const data = this.getItemDetails(id, meta);
        this.eventHandler.sendData('guild-item-details', data);
    }

}