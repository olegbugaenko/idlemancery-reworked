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
            attributes: {
                attribute_strength: [],     // [{timestamp: number, value: number}]
                attribute_charisma: [],     // [{timestamp: number, value: number}]
                attribute_patience: [],     // [{timestamp: number, value: number}]
                attribute_magic_ability: [], // [{timestamp: number, value: number}]
            }
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
                attributes: {
                    attribute_strength: [],
                    attribute_charisma: [],
                    attribute_patience: [],
                    attribute_magic_ability: [],
                }
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
            attributes: {
                attribute_strength: [],
                attribute_charisma: [],
                attribute_patience: [],
                attribute_magic_ability: [],
            }
        };

        this.lastMetricsSave = obj?.lastMetricsSave ?? 0;

        // Ensure arrays exist
        if (!Array.isArray(this.economicMetrics.coins)) {
            this.economicMetrics.coins = [];
        }
        if (!Array.isArray(this.economicMetrics.learningRate)) {
            this.economicMetrics.learningRate = [];
        }
        
        // Ensure attribute arrays exist
        if (!this.economicMetrics.attributes) {
            this.economicMetrics.attributes = {
                attribute_strength: [],
                attribute_charisma: [],
                attribute_patience: [],
                attribute_magic_ability: [],
            };
        }
        
        // Ensure each attribute array exists
        if (!Array.isArray(this.economicMetrics.attributes.attribute_strength)) {
            this.economicMetrics.attributes.attribute_strength = [];
        }
        if (!Array.isArray(this.economicMetrics.attributes.attribute_charisma)) {
            this.economicMetrics.attributes.attribute_charisma = [];
        }
        if (!Array.isArray(this.economicMetrics.attributes.attribute_patience)) {
            this.economicMetrics.attributes.attribute_patience = [];
        }
        if (!Array.isArray(this.economicMetrics.attributes.attribute_magic_ability)) {
            this.economicMetrics.attributes.attribute_magic_ability = [];
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
        
        // Get current attribute values (only if unlocked)
        const currentStrength = gameEffects.isEffectUnlocked('attribute_strength') ? gameEffects.getEffectValue('attribute_strength') : 0;
        const currentCharisma = gameEffects.isEffectUnlocked('attribute_charisma') ? gameEffects.getEffectValue('attribute_charisma') : 0;
        const currentPatience = gameEffects.isEffectUnlocked('attribute_patience') ? gameEffects.getEffectValue('attribute_patience') : 0;
        const currentMagicAbility = gameEffects.isEffectUnlocked('attribute_magic_ability') ? gameEffects.getEffectValue('attribute_magic_ability') : 0;
        
        console.log('Saving economic metrics:', {
            time: currentTime,
            coins: currentCoins,
            learningRate: currentLearningRate,
            attributes: {
                strength: currentStrength,
                charisma: currentCharisma,
                patience: currentPatience,
                magicAbility: currentMagicAbility
            }
        });

        // Add new metrics
        this.economicMetrics.coins.push({
            timestamp: currentTime,
            value: currentCoins,
        });

        this.economicMetrics.learningRate.push({
            timestamp: currentTime,
            value: currentLearningRate
        });

        // Add attribute metrics
        this.economicMetrics.attributes.attribute_strength.push({
            timestamp: currentTime,
            value: currentStrength,
        });

        this.economicMetrics.attributes.attribute_charisma.push({
            timestamp: currentTime,
            value: currentCharisma,
        });

        this.economicMetrics.attributes.attribute_patience.push({
            timestamp: currentTime,
            value: currentPatience,
        });

        this.economicMetrics.attributes.attribute_magic_ability.push({
            timestamp: currentTime,
            value: currentMagicAbility,
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

        // Trim attribute data
        Object.keys(this.economicMetrics.attributes).forEach(attrKey => {
            this.economicMetrics.attributes[attrKey] = this.economicMetrics.attributes[attrKey]
                .filter(entry => entry.timestamp >= oneWeekAgo)
                .slice(-this.maxMetricsEntries);
        });
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
            const resource = gameResources.getResource(resourceId);
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
            attributes: this.economicMetrics.attributes,
            currentCoins: gameResources.getResource('coins')?.cap || 0,
            currentLearningRate: gameEffects.getEffectValue('learning_rate') || 0,
            currentAttributes: {
                attribute_strength: gameEffects.isEffectUnlocked('attribute_strength') ? gameEffects.getEffectValue('attribute_strength') : 0,
                attribute_charisma: gameEffects.isEffectUnlocked('attribute_charisma') ? gameEffects.getEffectValue('attribute_charisma') : 0,
                attribute_patience: gameEffects.isEffectUnlocked('attribute_patience') ? gameEffects.getEffectValue('attribute_patience') : 0,
                attribute_magic_ability: gameEffects.isEffectUnlocked('attribute_magic_ability') ? gameEffects.getEffectValue('attribute_magic_ability') : 0,
            }
        };
    }

    sendTradingStatistics() {
        const data = this.getTradingStatistics();
        this.eventHandler.sendData('trading-statistics', data);
    }

    sendEconomicMetrics() {
        const data = this.getEconomicMetrics();
        console.log('Sending economic metrics:', data);
        this.eventHandler.sendData('economic-metrics', data);
    }
} 