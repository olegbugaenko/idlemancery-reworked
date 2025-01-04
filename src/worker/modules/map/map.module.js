import {GameModule} from "../../shared/game-module";
import {registerTileTypesDB} from "./tile-db";
import {gameEffects, gameEntity, gameResources} from "game-framework";
import {MapTileListsSubmodule} from "./map-tile-lists.submodule";

export class MapModule extends GameModule {

    constructor() {
        super();
        this.tileTypes = [];
        this.mapTiles = [];
        this.mapTilesProcessed = [];
        this.refreshTimeout = 0;
        this.highlightResources = {};

        this.lists = new MapTileListsSubmodule();

        this.eventHandler.registerHandler('query-map-data', () => {
            this.sendData();
        })

        this.eventHandler.registerHandler('map-highlight-resources', (payload) => {
            console.log('setHighLight: ', payload);
            this.highlightResources = {};
            payload.ids.forEach(id => {
                this.highlightResources[id] = true;
            })
            this.sendData();
        })

        this.eventHandler.registerHandler('query-map-tile-details', ({ i, j}) => {
            this.sendDetails({ i, j })
        })

        this.eventHandler.registerHandler('toggle-map-tile-running', ({i, j, flag}) => {
            if(flag) {
                this.stopRunningTiles(); // only one tile in single tile mode
            }
            this.setTileRunning(i, j, flag)
        })
    }

    initialize() {
        this.tileTypes = registerTileTypesDB();
        this.generateMap();
    }

    generateMap() {
        for(let i = 0; i < 15; i++) {
            this.mapTiles[i] = [];
            for(let j = 0; j < 15; j++ ) {
                if (i === 7 && j === 7) {
                    this.mapTiles[i][j] = {
                        i,
                        j,
                        distance: 0,
                        metaData: {
                            id: 'settlement',
                            name: 'Settlement',
                            color: '#666'
                        },
                        drops: [],
                        costMult: 0,
                        r: []
                    }
                } else {
                    this.mapTiles[i][j] = this.generateRandomTile(i, j);
                }
            }
        }
        this.processTiles();
    }

    generateRandomTile(i, j) {
        const expectType = Math.floor((Math.random()**1.5)*this.tileTypes.length);
        const distance = Math.sqrt((i-7)**2 + (j-7)**2);
        const metaData = this.tileTypes[expectType];
        const resources = gameResources.listResourcesByTags(['gatherable']);
        const complexity = Math.max(1, (distance-2) + Math.random()*(distance-2));
        return {
            distance,
            i,
            j,
            metaData,
            drops: this.generateRandomDrop(distance, complexity, metaData.id, resources),
            costMult: complexity ** 1.75,
        }
    }

    stopRunningTiles() {
        const activeEntities = gameEntity.listEntitiesByTags(['exploration']);

        activeEntities.forEach(ent => {
            this.setTileRunning(ent.attributes.i, ent.attributes.j, false, 1);
        })
    }

    setTileRunning(i, j, flag, effort = 1) {
        const runningEntityId = `tile_${i}_${j}_exploration`;
        const tileData = this.mapTilesProcessed[i][j];

        const isRunning = gameEntity.entityExists(runningEntityId);

        this.mapTiles[i][j].isRunning = flag;
        this.mapTiles[i][j].effort = effort;

        if(!flag) {
            if(isRunning) {
                gameEntity.unsetEntity(runningEntityId);
            }
        }
        if(flag) {
            if(!isRunning) {
                gameEntity.registerGameEntity(runningEntityId, {
                    name: `Map Exploration: ${i}:${j}`,
                    tags: ["map", "tile", "exploration"],
                    unlockCondition: () => true,
                    level: 1,
                    maxLevel: 1,
                    attributes: {
                        i,
                        j
                    },
                    effectFactor: effort,
                    resourceModifier: {
                        consumption: {
                            resources: {
                                'gathering_effort': {
                                    A: 0,
                                    B: tileData.cost.gathering_effort.value,
                                    type: 0
                                },
                            }
                        },
                        effectDeps: ['gathering_efficiency']
                    }
                })
                gameEntity.setEntityLevel(runningEntityId, 1, true);
            }
        }
        this.processTiles();
        this.sendData();
    }

    generateRandomDrop(distance, complexity, expectType, resources) {
        // Filter resources to match the expected tile type
        const potentialResources = resources.filter(one =>
            !one.allowedTileTypes || one.allowedTileTypes.includes(expectType)
        );

        // If no matching resources, return an empty array
        if (potentialResources.length === 0) {
            return [];
        }

        // Separate resources by rarity
        const rarityBuckets = {
            low: potentialResources.filter(r => r.rarity <= 1), // rarity 0-1
            mid: potentialResources.filter(r => r.rarity >= 2 && r.rarity <= 3), // rarity 2-3
            high: potentialResources.filter(r => r.rarity >= 4 && r.rarity <= 5) // rarity 4-5
        };

        console.log('rarityBuckets: ', rarityBuckets, potentialResources);

        // Ensure we have at least 1 resource with rarity 0-1
        const drops = [];
        if (rarityBuckets.low.length > 0) {
            for(let i = 0; i < Math.min(2, rarityBuckets.low.length); i++) {
                const lowRarityResource = rarityBuckets.low[Math.floor(Math.random() * rarityBuckets.low.length)];
                drops.push({
                    id: lowRarityResource.id,
                    amountMult: complexity / ((1 + lowRarityResource.rarity)*(lowRarityResource.sellPrice ** 0.05)),
                    probabilityMult: (complexity ** 0.4) / ((1 + (lowRarityResource.rarity ** 0.5))*(lowRarityResource.sellPrice ** 0.25)),
                });
            }
        }

        // Determine how many more resources are needed (at least 3 in total)
        const remainingDropsCount = 5 - drops.length;

        // Add resources from other rarity levels
        const additionalDrops = [];
        for (let i = 0; i < remainingDropsCount; i++) {
            const roll = Math.random();
            let bucket;

            if (roll < 0.75 && rarityBuckets.mid.length > 0) {
                // 50% chance to pick from rarity 2-3
                bucket = rarityBuckets.mid;
            } else if (roll < 0.95 && rarityBuckets.high.length > 0) {
                // 25% chance to pick from rarity 4-5
                bucket = rarityBuckets.high;
            } else if (rarityBuckets.low.length > 0) {
                // Default back to rarity 0-1 if no other buckets are valid
                bucket = rarityBuckets.low;
            }

            if (bucket && bucket.length > 0) {
                const selectedResource = bucket[Math.floor(Math.random() * bucket.length)];
                additionalDrops.push({
                    id: selectedResource.id,
                    amountMult: complexity / ((1 + selectedResource.rarity)*(selectedResource.sellPrice ** 0.05)),
                    probabilityMult: (complexity ** 0.5) / (((1 + (selectedResource.rarity ** 0.5)))*(selectedResource.sellPrice ** 0.25))
                });
            }
        }

        // Combine the guaranteed low rarity drop and additional drops
        drops.push(...additionalDrops);

        // Ensure unique drops (remove duplicates by ID)
        const uniqueDrops = Array.from(new Map(drops.map(r => [r.id, r])).values());

        // Trim to exactly 3 drops
        return uniqueDrops.slice(0, 5);
    }

    processTiles() {
        this.mapTilesProcessed = [];
        this.filterableLoots = {};
        for(let i = 0; i < this.mapTiles.length; i++) {
            this.mapTilesProcessed[i] = [];
            for(let j = 0; j < this.mapTiles[i].length; j++) {
                let efficiency = 1;
                if(gameEntity.entityExists(`tile_${i}_${j}_exploration`)) {
                    efficiency = gameEntity.getEntityEfficiency(`tile_${i}_${j}_exploration`);
                }
                const effEff = efficiency ** 0.5;
                const r = this.mapTiles[i][j].r ?? [];
                if(r.length && r.length > this.mapTiles[i][j].drops.length) {
                    this.mapTiles[i][j].r = [...new Set(r)];
                }
                const isNoviceArea = Math.abs(i-7) < 2 && Math.abs(j-7) < 2;
                this.mapTilesProcessed[i][j] = {
                    ...this.mapTiles[i][j],
                    efficiency,
                    effEff,
                    drops: this.mapTiles[i][j].drops.map((d, index) => {
                        const isRevealed = this.mapTiles[i][j].r?.includes(index);
                        const rs = gameResources.getResource(d.id);
                        const isHerb = rs.tags.includes('herb');
                        const isRare = rs.tags.includes('rare');
                        let amtHerbsMult = 1.;
                        if(isHerb) {
                            amtHerbsMult = gameEffects.getEffectValue('gathering_herbs_amount');
                            if(isRare) {
                                amtHerbsMult = 0.25*amtHerbsMult ** 0.5;
                            }
                        }
                        let rarityProbMult = 1.;
                        if(rs.rarity <= 2) {
                            rarityProbMult *= gameEffects.getEffectValue('gathering_low_chance') ** (1/(1 + 0.25*rs.rarity));
                        }
                        if(isRevealed) {
                            if(!this.filterableLoots[d.id]) {
                                this.filterableLoots[d.id] = [];
                            }
                            this.filterableLoots[d.id].push({
                                i,
                                j
                            })
                        }
                        let prob = 0.03*d.probabilityMult*rarityProbMult*effEff*(1 + (gameResources.getResource('gathering_perception').amount ** 0.75));
                        if(prob > 0.2) {
                            prob = Math.min(0.5, 0.2 + (prob - 0.2) ** 1.5)
                        }
                        return {
                            ...d,
                            probability: prob,
                            amountMin: Math.max(1, 3*d.amountMult*effEff*amtHerbsMult),
                            amountMax: Math.max(1, 6*d.amountMult*effEff*amtHerbsMult),
                            isRevealed,
                        }
                    }),
                    cost: {
                        ['gathering_effort']: {
                            name: gameResources.getResource('gathering_effort').name,
                            value: this.mapTiles[i][j].costMult * (isNoviceArea ? 0.25 : 1)
                        }
                    }
                }
            }
        }
    }

    save() {
        return {
            mapTiles: this.mapTiles,
            lists: this.lists.save()
        }
    }

    load(obj) {
        if(obj?.mapTiles) {
            this.mapTiles = obj.mapTiles;
            for(let i = 0; i < this.mapTiles.length; i++) {
                for(let j = 0; j < this.mapTiles[i].length; j++) {
                    if(this.mapTiles[i][j].isRunning) {
                        this.setTileRunning(i, j, true, this.mapTiles[i][j].effort);
                    } else {
                        this.setTileRunning(i, j, false, 1);
                    }
                }
            }
            this.processTiles();
        } else {
            this.generateMap();
        }
        this.lists.load(obj?.lists || {});
    }

    getData() {
        const filterableLoot = Object.keys(this.filterableLoots).map(one => ({
            ...gameResources.getResource(one),
            isSelected: this.highlightResources[one]
        }));
        return {
            mapTiles: this.mapTilesProcessed.map(row => row.map(col => {
                const isHighlight = col.drops.some(drop => this.highlightResources[drop.id] && drop.isRevealed);
                return {
                    ...col,
                    drops: col.drops.map((drop, index) => ({
                        ...drop,
                        resource: gameResources.getResource(drop.id),
                    })),
                    isHighlight
                }
            })),
            explorationPoints: gameResources.getResource('gathering_effort'),
            mapLists: this.lists.getLists(),
            filterableLoot,
        }
    }

    sendData() {
        const data = this.getData();
        // console.log('DATA: ', data);
        this.eventHandler.sendData('map-data', data);
    }

    getDetails(i, j) {

        const tile = this.mapTilesProcessed[i][j];
        // console.log('Querying tile.drops: ', i, j, tile.drops, tile.drops.filter((drop, index) => (!tile.r?.includes(index)) && gameResources.isResourceUnlocked(drop.id)));

        return {
            ...tile,
            name: tile.metaData.name,
            unlockedUnrevealedAmount: tile.drops.filter((drop, index) => (!tile.r?.includes(index)) && gameResources.isResourceUnlocked(drop.id)).length,
            drops: tile.drops.map((drop, index) => ({
                ...drop,
                resource: gameResources.getResource(drop.id),
                isRevealed: tile.r?.includes(index) && gameResources.isResourceUnlocked(drop.id)
            })).filter(one => one.isRevealed)
        }
    }

    sendDetails({ i, j}) {
        const data = this.getDetails(i, j);

        this.eventHandler.sendData('map-tile-details', data);
    }

    tick(game, delta) {
        this.refreshTimeout -= delta;
        if(this.refreshTimeout <= 0) {
            this.processTiles();
            this.refreshTimeout = 2;

            // attempt to drop something
            const activeEntities = gameEntity.listEntitiesByTags(['exploration']);

            activeEntities.forEach(ent => {
                const tile = this.mapTilesProcessed[ent.attributes.i][ent.attributes.j];
                tile.drops.forEach((drop, index) => {
                    if(!gameResources.isResourceUnlocked(drop.id)) {
                        return;
                    }
                    const roll = Math.random();
                    if(roll < 2*drop.probability*ent.effectFactor) {
                        const amt = Math.round(drop.amountMin + Math.random()*drop.amountMax);
                        gameResources.addResource(drop.id, amt);
                        if(!this.mapTiles[ent.attributes.i][ent.attributes.j].r) {
                            this.mapTiles[ent.attributes.i][ent.attributes.j].r = []
                        }
                        if(!this.mapTiles[ent.attributes.i][ent.attributes.j].r.includes(index)) {
                            this.mapTiles[ent.attributes.i][ent.attributes.j].r.push(index);
                        }
                        console.log(`Found ${drop.id} at ${ent.attributes.i}:${ent.attributes.j} with chance ${roll} < ${drop.probability}: ${amt}. EntEff: ${ent.efficiency}`, this.mapTiles[ent.attributes.i][ent.attributes.j]);
                    }
                })
            })
        }

        this.lists.tick(game, delta);


    }
}