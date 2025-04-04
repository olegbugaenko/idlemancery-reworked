import {GameModule} from "../../shared/game-module";
import {registerTileTypesDB} from "./tile-db";
import {gameCore, gameEffects, gameEntity, gameResources, resourceApi, resourceCalculators} from "game-framework";
import {MapTileListsSubmodule} from "./map-tile-lists.submodule";
import {SMALL_NUMBER} from "game-framework/src/utils/consts";

export class MapModule extends GameModule {

    constructor() {
        super();
        this.tileTypes = [];
        this.mapTiles = [];
        this.mapTilesProcessed = [];
        this.refreshTimeout = 0;
        this.highlightResources = {};
        this.highlightFilters = {};
        this.mapCreationSettings = {
            level: 0,
        }
        this.mapTier = 0;
        this.relevantMapVersion = 2;
        this.currentMapVersion = null;

        this.lists = new MapTileListsSubmodule();

        this.eventHandler.registerHandler('query-map-data', () => {
            this.sendData();
        })

        this.eventHandler.registerHandler('map-highlight-filter', (payload) => {
            // console.log('setHighLight: ', payload);
            if('highlightUnexplored' in payload) {
                this.highlightFilters['highlightUnexplored'] = payload.highlightUnexplored;
            }
            if('effortMin' in payload) {
                this.highlightFilters['effortMin'] = payload.effortMin;
            }
            if('effortMax' in payload) {
                this.highlightFilters['effortMax'] = payload.effortMax;
            }
            this.sendData();
        })

        this.eventHandler.registerHandler('query-map-list-highlighted-tiles', (payload) => {
            const data = this.getHighlightedTiles();
            this.eventHandler.sendData('map-list-highlighted-tiles', { tiles: data })
        })

        this.eventHandler.registerHandler('map-highlight-resources', (payload) => {
            // console.log('setHighLight: ', payload);
            this.highlightResources = {};
            payload.ids.forEach(id => {
                this.highlightResources[id] = true;
            })
            this.sendData();
        })

        this.eventHandler.registerHandler('map-set-generated-level', (payload) => {
            // console.log('setGeneratedLevel: ', payload);
            this.mapCreationSettings.level = Math.max(0, Math.min(Math.floor(gameEffects.getEffectValue('max_map_level')), payload.level));
            this.sendData();
            this.sendGeneralData();
        })

        this.eventHandler.registerHandler('map-query-general-data', () => {
            this.sendGeneralData();
        })

        this.eventHandler.registerHandler('map-generate-map', (payload) => {
            this.purchaseMap()
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

    generateMap(tier = 0) {
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
                    this.mapTiles[i][j] = this.generateRandomTile(i, j, tier);
                }
            }
        }
        this.currentMapVersion = this.relevantMapVersion;
        this.mapTier = tier;
        this.processTiles();
    }

    generateRandomTile(i, j, tier) {
        const expectType = Math.floor((Math.random()**1.5)*this.tileTypes.length);
        const distance = Math.sqrt((i-7)**2 + (j-7)**2);
        const metaData = this.tileTypes[expectType];
        const resources = gameResources.listResourcesByTags(['gatherable']);
        const complexity = Math.max(1, (distance-2) + (Math.random() + 0.75*(tier**0.5))*(distance-2 + 3*(tier**0.5)))*Math.pow(1.3, tier);
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

        // console.log('rarityBuckets: ', rarityBuckets, potentialResources);

        // Ensure we have at least 1 resource with rarity 0-1
        const drops = [];
        if (rarityBuckets.low.length > 0) {
            for(let i = 0; i < Math.min(2, rarityBuckets.low.length); i++) {
                const lowRarityResource = rarityBuckets.low[Math.floor(Math.random() * rarityBuckets.low.length)];
                drops.push({
                    id: lowRarityResource.id,
                    amountMult: complexity / ((1 + lowRarityResource.rarity)*(lowRarityResource.sellPrice ** 0.05)),
                    probabilityMult: (complexity ** 0.3) / ((1 + (lowRarityResource.rarity ** 0.5))*(lowRarityResource.sellPrice ** 0.25)),
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

    getGatheringPerceptionEffect() {
        return (1 + gameResources.getResource('gathering_perception').amount) ** 0.25;
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
                        const gatheringPerceptionEffect = this.getGatheringPerceptionEffect();
                        let prob = 0.09*d.probabilityMult*rarityProbMult*effEff*gatheringPerceptionEffect;
                        if(prob > 0.2) {
                            prob = Math.min(0.5, 0.2 + (prob - 0.2) ** 1.5)
                        }
                        if(isRare && prob > 0.05) {
                            prob = 0.05 + (prob - 0.05) ** 2;
                            if(prob > 0.1) {
                                prob = 0.1;
                            }
                        }
                        return {
                            ...d,
                            rarityTier: isRare ? 'rare' : 'common',
                            probability: prob,
                            amountMin: Math.max(1, 3*d.amountMult*effEff*amtHerbsMult*(rs.lootAmountMult || 1)),
                            amountMax: Math.max(1, 6*d.amountMult*effEff*amtHerbsMult*(rs.lootAmountMult || 1)),
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
            lists: this.lists.save(),
            mapCreationSettings: this.mapCreationSettings,
            currentMapVersion: this.currentMapVersion,
            highlightFilters: this.highlightFilters,
            mapTier: this.mapTier,
        }
    }

    load(obj) {
        this.currentMapVersion = obj?.currentMapVersion;
        if(obj?.mapCreationSettings) {
            this.mapCreationSettings = obj?.mapCreationSettings;
        }
        if(obj?.mapTiles && (this.currentMapVersion && this.currentMapVersion >= this.relevantMapVersion)) {
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
        this.highlightFilters = {};
        if(obj?.highlightFilters) {
            this.highlightFilters = obj.highlightFilters;
        }
        this.mapTier = obj?.mapTier;
    }

    mapGenerationCost() {
        const level = this.mapCreationSettings.level ?? 0;

        let result = {
            isAffordable: true,
            consume: {}
        }

        result.consume['inventory_map_fragment'] = 10*Math.pow(4, level) / gameEffects.getEffectValue('map_generation_discount');
        if(result.consume['inventory_map_fragment'] > gameResources.getResource('inventory_map_fragment').amount) {
            result.isAffordable = false;
        }

        return result;
    }

    mapGenerationEffortBounds() {
        const level = this.mapCreationSettings.level ?? 0;
        const maxDist = 7*Math.sqrt(2);
        const maxComplexity = Math.max(1, (maxDist-2) + (1 + 0.75*(level**0.5))*(maxDist-2 + 3*(level**0.5)))*Math.pow(1.3, level)
        const minComplexity = Math.max(1, (-1 + 0.75*(level**0.5))*(-1 + 3*(level**0.5)))*Math.pow(1.3, level)
        let result = {
            min: 0.25 * minComplexity ** 1.75,
            max: maxComplexity ** 1.75,
        }
        return result;
    }

    purchaseMap() {
        const cost = this.mapGenerationCost();

        if(!cost.isAffordable) return;

        for(const rId in cost.consume) {
            gameResources.addResource(rId, -cost.consume[rId]);
        }

        this.lists.stopList();

        for(const lId in this.lists.mapLists) {
            this.lists.deleteMapTilesList(lId);
        }

        this.highlightResources = {};

        this.generateMap(this.mapCreationSettings.level);
    }

    isMapTileHighlighted(iRow, iCol) {
        const col = this.mapTilesProcessed[iRow][iCol];

        const hasHighlightResources = Object.keys(this.highlightResources).length > 0;
        const { highlightUnexplored, effortMin, effortMax } = this.highlightFilters;

        const emptyConds = !hasHighlightResources && !highlightUnexplored && !effortMin && !effortMax;

        if (emptyConds) return false;

        let isHighlight = true;

        if (hasHighlightResources) {
            isHighlight = col.drops.some(drop => this.highlightResources[drop.id] && drop.isRevealed);
            if (!isHighlight) return false; // Early exit optimization
        }

        if (highlightUnexplored) {
            const hasUnexplored = col.drops.some(drop =>
                gameResources.isResourceUnlocked(drop.id) && !drop.isRevealed
            );
            if (!hasUnexplored) return false;
        }

        if (effortMin) {
            if (col.cost['gathering_effort'].value < effortMin) return false;
        }

        if (effortMax) {
            if (col.cost['gathering_effort'].value > effortMax) return false;
        }

        return true;
    }

    getHighlightedTiles() {
        const highlightedTiles = [];

        for (let iRow = 0; iRow < this.mapTilesProcessed.length; iRow++) {
            for (let iCol = 0; iCol < this.mapTilesProcessed[iRow].length; iCol++) {
                if (this.isMapTileHighlighted(iRow, iCol)) {
                    highlightedTiles.push({ iRow, iCol });
                }
            }
        }

        return highlightedTiles;
    }



    getData() {
        const filterableLoot = Object.keys(this.filterableLoots).map(one => ({
            ...gameResources.getResource(one),
            isSelected: this.highlightResources[one]
        }));
        return {
            mapTiles: this.mapTilesProcessed.map((row, iRow) => row.map((col, iCol) => {
                const isHighlighted = this.isMapTileHighlighted(iRow, iCol);

                return {
                    ...col,
                    drops: col.drops.map((drop, index) => ({
                        ...drop,
                        resource: gameResources.getResource(drop.id),
                    })),
                    isHighlight: isHighlighted,
                }
            })),
            explorationPoints: {
                ...gameResources.getResource('gathering_effort'),
                isPinned: !!gameCore.getModule('resource-pool').pinnedResources?.['gathering_effort']
            },
            mapLists: this.lists.getLists(),
            highlightFilters: this.highlightFilters,
            filterableLoot,
        }
    }

    sendGeneralData() {
        const data = {
            mapGeneration: {
                isUnlocked: gameResources.isResourceUnlocked('inventory_map_fragment'),
                level: this.mapCreationSettings.level,
                affordable: resourceCalculators.isAffordable(this.mapGenerationCost().consume),
                maxLevel: gameEffects.getEffectValue('max_map_level'),
                explorationBoundaries: this.mapGenerationEffortBounds()
            },
            isProducingGathering: gameResources.getResource('gathering_effort').income > SMALL_NUMBER,
            stats: {
                effects: [
                    {id: 'map_level', name: 'Map Level', value: this.mapTier},
                    {...gameEffects.getEffect('gathering_low_chance'), isMultiplier: true},
                    {...gameEffects.getEffect('gathering_herbs_amount'), isMultiplier: true},
                    {...gameResources.getResource('gathering_perception'), isMultiplier: false, value: gameResources.getResource('gathering_perception').amount},
                    {id: 'perception_effect', name: 'Gathering Perception Effect', value: this.getGatheringPerceptionEffect(), description: 'Multiplier to find probabilities provided by Gathering Perception', isMultiplier: true},
                    {...gameEffects.getEffect('map_generation_discount'), isMultiplier: true}
                ].filter(one => ((!one.isMultiplier && (one.value > SMALL_NUMBER)) || (one.isMultiplier && (Math.abs(one.value - 1) > SMALL_NUMBER))))
            }
        }
        this.eventHandler.sendData('map-general-data', data);
    }

    sendData() {
        const data = this.getData();
        // console.log('DATA: ', data);
        this.eventHandler.sendData('map-data', data);
    }

    getDetails(i, j) {
        console.log('GetDetails: ', i, j, this.mapTilesProcessed[i])
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
                        const amt = Math.round(drop.amountMin + Math.random()*(drop.amountMax - drop.amountMin));
                        gameResources.addResource(drop.id, amt);
                        if(!this.mapTiles[ent.attributes.i][ent.attributes.j].r) {
                            this.mapTiles[ent.attributes.i][ent.attributes.j].r = []
                        }
                        if(!this.mapTiles[ent.attributes.i][ent.attributes.j].r.includes(index)) {
                            this.mapTiles[ent.attributes.i][ent.attributes.j].r.push(index);
                        }
                        // console.log(`Found ${drop.id} at ${ent.attributes.i}:${ent.attributes.j} with chance ${roll} < ${drop.probability}: ${amt}. EntEff: ${ent.efficiency}`, this.mapTiles[ent.attributes.i][ent.attributes.j]);
                    }
                })
            })
        }

        this.lists.tick(game, delta);


    }
}