import {GameModule} from "../../shared/game-module";
import {gameCore, gameEffects, gameEntity, gameResources} from "game-framework";

export class StatisticsModule extends GameModule {

    constructor(props) {
        super(props);

        this.currentVersion = 1;

        // Trading statistics
        this.tradingHistory = {
            bought: {}, // resourceId -> {amount: number, totalCost: number}
            sold: {},   // resourceId -> {amount: number, totalEarnings: number}
        };

        // Economic metrics over time (every 30 minutes)
        this.economicMetrics = {
            coins: [],      // [{timestamp: number, value: number}]
            learningRate: [], // [{timestamp: number, value: number}]
        };

        this.lastMetricsSave = 0;
        this.metricsSaveInterval = 30 * 60; // 30 minutes in seconds

        // Keep only last week of data (7 days * 24 hours * 2 saves per hour = 336 entries)
        this.maxMetricsEntries = 336;

        this.eventHandler.registerHandler('query-trading-statistics', (payload) => {
            this.sendTradingStatistics();
        });

        this.eventHandler.registerHandler('query-economic-metrics', (payload) => {
            this.sendEconomicMetrics();
        });

                            // Trading events are handled via direct method calls from other modules
        
    }

    initialize() {
        // Nothing to initialize
    }

    tick(game, delta) {
        // Save economic metrics every 30 minutes
        console.log('LS: ', this.lastMetricsSave, this.metricsSaveInterval, this.economicMetrics);
        this.lastMetricsSave += delta;
        if (this.lastMetricsSave >= this.metricsSaveInterval) {
            this.lastMetricsSave = 0;
            this.saveEconomicMetrics();
        }
    }

    save() {
        return {
            tradingHistory: this.tradingHistory,
            economicMetrics: this.economicMetrics,
            version: this.currentVersion,
            lastMetricsSave: this.lastMetricsSave,
        };
    }

    load(obj) {
        // Backward compatibility: if no version or old version, initialize with defaults
        if (!obj?.version || obj?.version < this.currentVersion) {
            this.tradingHistory = {
                bought: {},
                sold: {},
            };
            this.economicMetrics = {
                coins: [],
                learningRate: [],
            };
            return;
        }

        this.tradingHistory = obj?.tradingHistory || {
            bought: {},
            sold: {},
        };

        this.economicMetrics = obj?.economicMetrics || {
            coins: [],
            learningRate: [],
        };

        this.lastMetricsSave = obj?.lastMetricsSave ?? 0;

        // Ensure arrays exist
        if (!Array.isArray(this.economicMetrics.coins)) {
            this.economicMetrics.coins = [];
        }
        if (!Array.isArray(this.economicMetrics.learningRate)) {
            this.economicMetrics.learningRate = [];
        }
    }

    recordTrade(type, resourceId, amount, totalValue) {
        if (!this.tradingHistory[type][resourceId]) {
            this.tradingHistory[type][resourceId] = {
                amount: 0,
                totalValue: 0
            };
        }

        this.tradingHistory[type][resourceId].amount += amount;
        this.tradingHistory[type][resourceId].totalValue += totalValue;
    }

    saveEconomicMetrics() {
        const currentTime = gameCore.globalTime;
        
        // Get current values
        const coinsResource = gameResources.getResource('coins');
        const currentCoins = coinsResource ? coinsResource.cap : 0;
        
        const currentLearningRate = gameEffects.getEffectValue('learning_rate');
        
        // Add new metrics
        this.economicMetrics.coins.push({
            timestamp: currentTime,
            value: currentCoins,
        });

        this.economicMetrics.learningRate.push({
            timestamp: currentTime,
            value: currentLearningRate
        });

        // Keep only recent data (last week)
        this.trimOldMetrics();
    }

    trimOldMetrics() {
        const oneWeekAgo = gameCore.globalTime - (7 * 24 * 60 * 60); // 7 days ago

        // Trim coins data
        this.economicMetrics.coins = this.economicMetrics.coins
            .filter(entry => entry.timestamp >= oneWeekAgo)
            .slice(-this.maxMetricsEntries);

        // Trim learning rate data
        this.economicMetrics.learningRate = this.economicMetrics.learningRate
            .filter(entry => entry.timestamp >= oneWeekAgo)
            .slice(-this.maxMetricsEntries);
    }

    getTradingStatistics() {
        const allResources = gameEntity.listEntitiesByTags(['resource']);
        const tradingStats = {
            bought: [],
            sold: [],
            totalBoughtValue: 0,
            totalSoldValue: 0
        };

        // Process bought resources
        for (const [resourceId, data] of Object.entries(this.tradingHistory.bought)) {
            const resource = gameResources.getResource(resourceId);
            if (resource) {
                tradingStats.bought.push({
                    id: resourceId,
                    name: resource.name,
                    amount: data.amount,
                    totalCost: data.totalValue,
                    averagePrice: data.amount > 0 ? data.totalValue / data.amount : 0
                });
                tradingStats.totalBoughtValue += data.totalValue;
            }
        }

        // Process sold resources
        for (const [resourceId, data] of Object.entries(this.tradingHistory.sold)) {
            const resource = gameEntity.getEntity(resourceId);
            if (resource) {
                tradingStats.sold.push({
                    id: resourceId,
                    name: resource.name,
                    amount: data.amount,
                    totalEarnings: data.totalValue,
                    averagePrice: data.amount > 0 ? data.totalValue / data.amount : 0
                });
                tradingStats.totalSoldValue += data.totalValue;
            }
        }

        // Sort by total value (descending)
        tradingStats.bought.sort((a, b) => b.totalCost - a.totalCost);
        tradingStats.sold.sort((a, b) => b.totalEarnings - a.totalEarnings);

        return tradingStats;
    }

    getEconomicMetrics() {
        return {
            coins: this.economicMetrics.coins,
            learningRate: this.economicMetrics.learningRate,
            currentCoins: gameResources.getResource('coins')?.cap || 0,
            currentLearningRate: gameEffects.getEffectValue('learning_rate') || 0
        };
    }

    sendTradingStatistics() {
        const data = this.getTradingStatistics();
        this.eventHandler.sendData('trading-statistics', data);
    }

    sendEconomicMetrics() {
        const data = this.getEconomicMetrics();
        this.eventHandler.sendData('economic-metrics', data);
    }
} 