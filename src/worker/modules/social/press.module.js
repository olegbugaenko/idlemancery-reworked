import {GameModule} from "../../shared/game-module";
import {gameEntity, gameCore, gameEffects, gameResources} from "game-framework"
import {registerPressJournals} from "./press-journals-db"

export class PressModule extends GameModule {
    constructor(){
        super()
        this.journals = {}
        this.effortAssign = {}

        this.eventHandler.registerHandler('query-press-state', () => {
            this.eventHandler.sendData('press-state', this.getState())
        })

        this.eventHandler.registerHandler('assign-effort', ({id, effort}) => {
            // Set effort for a single journal
            this.setJournalEffort(id, effort);
            // Send updated state
            this.eventHandler.sendData('press-state', this.getState());
        })

        this.eventHandler.registerHandler('query-press-journal-details', ({id}) => {
            this.eventHandler.sendData('press-journal-details', this.getJournalDetails(id));
        })
    }

    initialize() {
        registerPressJournals();
    }

    getJournals() {
        return gameEntity.listEntitiesByTags(['press_journal']).filter(one => {
            return gameEntity.isEntityUnlocked(one.id)
        });
    }

    isPressUnlocked() {
        return gameEntity.getLevel('printing_machine') > 0;
    }

    getJournalXPMax(journalId) {
        const ent = gameEntity.getEntity(journalId);
        const level = gameEntity.getLevel(journalId);
        const baseXPCost = ent?.attributes?.baseXPCost || 100;
        
        // Similar to actions: baseXPCost * 1.01^(level-1) * (0.8 + 0.2*level)
        return Math.max(1, baseXPCost * Math.pow(1.01, level - 1) * (0.8 + 0.2 * level));
    }

    getJournalXPRate(journalId, delta) {
        const printingEffort = gameResources.getResource('printing_effort').amount;
        const effort = this.effortAssign[journalId] || 0;
        const learningSpeed = gameEffects.getEffectValue('press_learning_speed');
        
        // XP per tick = effort * printing_effort * delta * learning_speed
        return effort * printingEffort * delta * learningSpeed;
    }

    ensureJournalData(journalId) {
        if (!this.journals[journalId]) {
            this.journals[journalId] = {
                xp: 0,
                level: 1,
            };
        }
    }

    calculateAnalyticalETA(currentLevel, targetLevel, baseCost, xpRate = 0, cxp = 0) {
        if(!currentLevel) {
            currentLevel = 1;
        }
        if(xpRate <= 0) {
            return Infinity;
        }
        
        const ln = Math.log;
        const a = baseCost;
        const logFactor = ln(1.01);

        function integralAtLevel(x) {
            const term1 = Math.pow(1.01, x) / logFactor;
            const term2 = (0.2 * x * Math.pow(1.01, x)) / logFactor;
            const term3 = 0.2 * Math.pow(1.01, x) / (logFactor * logFactor);
            return a * (term1 + term2 - term3);
        }

        // Calculate the integral difference for levels U and L
        const totalXP = integralAtLevel(targetLevel) - integralAtLevel(currentLevel);
        const eta = (totalXP - cxp) / xpRate;

        return eta;
    }

    findNextKeypoints(currentLevel, max) {
        let keypoints = [];
        [25, 50, 100].forEach(divisor => {
            let nextKeypoint = Math.ceil(currentLevel / divisor) * divisor;
            if (nextKeypoint === currentLevel) {
                nextKeypoint += divisor;
            }
            if(keypoints.includes(nextKeypoint)) {
                nextKeypoint += divisor;
            }
            if(max && nextKeypoint > max) {
                nextKeypoint = max;
            }
            keypoints.push(nextKeypoint);
        });
        return [...new Set(keypoints)].sort((a, b) => a - b);
    }

    getJournalEtas(journalId) {
        const ent = gameEntity.getEntity(journalId);
        const level = gameEntity.getLevel(journalId);
        const xpRate = this.getJournalXPRate(journalId, 1);
        const keypoints = this.findNextKeypoints(level, ent?.maxLevel);
        const etaResults = {};
        
        keypoints.forEach(keypoint => {
            const eta = this.calculateAnalyticalETA(
                level, 
                keypoint, 
                ent?.attributes?.baseXPCost || 100, 
                xpRate, 
                this.journals[journalId]?.xp || 0
            );
            etaResults[keypoint] = eta;
        });
        
        return etaResults;
    }

    getState() {
        // Return effort, assign, journals (level/xp etc.)
        return {
            printing_effort: gameResources.getResource('printing_effort').amount,
            assign: this.effortAssign,
            journals: this.getJournals().map(jid=>this.getJournalState(jid.id))
        }
    }

    getJournalState(journalId) {
        this.ensureJournalData(journalId);
        const ent = gameEntity.getEntity(journalId);
        const level = gameEntity.getLevel(journalId);
        
        return {
            id: journalId,
            name: ent?.name,
            desc: ent?.description,
            level,
            xp: this.journals[journalId]?.xp || 0,
            maxXP: this.getJournalXPMax(journalId),
            maxLevel: ent?.maxLevel,
            effortAssigned: this.effortAssign[journalId] || 0,
            xpRate: this.getJournalXPRate(journalId, 1) // Rate per second
        }
    }

    getJournalDetails(journalId) {
        this.ensureJournalData(journalId);
        const ent = gameEntity.getEntity(journalId);
        const level = gameEntity.getLevel(journalId);
        
        return {
            id: journalId,
            name: ent?.name,
            desc: ent?.description,
            level,
            xp: this.journals[journalId]?.xp || 0,
            maxXP: this.getJournalXPMax(journalId),
            maxLevel: ent?.maxLevel,
            baseXPCost: ent?.attributes?.baseXPCost,
            xpRate: this.getJournalXPRate(journalId, 1),
            currentEffects: gameEntity.getEffects(journalId, 0, level, true),
            potentialEffects: gameEntity.getEffects(journalId, 0, level + 1, true),
            etas: this.getJournalEtas(journalId)
        }
    }

    // Called from tick
    applyEffort(delta) {
        const printingEffort = gameResources.getResource('printing_effort').amount;
        
        if (printingEffort <= 0) return;
        
        const journals = this.getJournals();
        
        for (const journal of journals) {
            const journalId = journal.id;
            const effort = this.effortAssign[journalId] || 0;
            
            if (effort <= 0) continue;
            
            this.ensureJournalData(journalId);
            
            // Calculate XP gain this tick
            const dxp = this.getJournalXPRate(journalId, delta);
            this.journals[journalId].xp += dxp;
            
            // Check for level up
            const maxXP = this.getJournalXPMax(journalId);
            if (this.journals[journalId].xp >= maxXP) {
                const currentLevel = gameEntity.getLevel(journalId);
                const maxLevel = journal.maxLevel;
                
                if (!maxLevel || currentLevel < maxLevel) {
                    // Level up!
                    this.journals[journalId].xp -= maxXP;
                    this.journals[journalId].level = currentLevel + 1;
                    gameEntity.setEntityLevel(journalId, currentLevel + 1, true);
                    
                    console.log(`Press Journal ${journal.name} leveled up to ${currentLevel + 1}!`);
                    
                    // If maxed, stop assigning effort to it
                    if (maxLevel && currentLevel + 1 >= maxLevel) {
                        this.effortAssign[journalId] = 0;
                        this.normalizeTotalEffort();
                    }
                } else {
                    // Already maxed, cap XP
                    this.journals[journalId].xp = maxXP;
                }
            }
        }
    }

    setJournalEffort(journalId, effort) {
        // Clamp effort between 0 and 1
        if (effort < 0) effort = 0;
        if (effort > 1) effort = 1;

        // Set the new effort
        this.effortAssign[journalId] = effort;

        // Recalculate remaining efforts for other journals
        // remaining = 1 - current effort (e.g., if set to 0.7, remaining is 0.3)
        this.recalculateRemaining(journalId, 1 - effort);
    }

    recalculateRemaining(skipId, remainingToRedistribute) {
        const journals = this.getJournals();
        
        // Calculate total effort of other journals (excluding the one we just changed)
        let currentEffortsTotal = 0;
        for (const journal of journals) {
            const id = journal.id;
            if (id !== skipId) {
                currentEffortsTotal += (this.effortAssign[id] || 0);
            }
        }

        // Calculate multiplier to scale other efforts to fit in remaining space
        const mult = currentEffortsTotal > 0 ? remainingToRedistribute / currentEffortsTotal : 0;
        
        console.log('recalculateRemaining: ', {
            skipId,
            remainingToRedistribute, 
            currentEffortsTotal, 
            mult
        });

        // Scale all other journals proportionally
        for (const journal of journals) {
            const id = journal.id;
            if (id !== skipId) {
                const currentEffort = this.effortAssign[id] || 0;
                this.effortAssign[id] = currentEffort * mult;
                console.log(`recalculateRemaining: changing ${id} effort from ${currentEffort} to ${currentEffort * mult}`);
            }
        }
    }

    normalizeTotalEffort() {
        // Calculate total effort
        let totalEffort = 0;
        const journals = this.getJournals();
        
        for (const journal of journals) {
            totalEffort += (this.effortAssign[journal.id] || 0);
        }

        // If total exceeds 100%, normalize all proportionally
        if (totalEffort > 1.001) {
            console.warn(`Total effort exceeded 100%: ${(totalEffort * 100).toFixed(2)}%. Normalizing...`);
            
            for (const journal of journals) {
                const currentEffort = this.effortAssign[journal.id] || 0;
                if (currentEffort > 0) {
                    this.effortAssign[journal.id] = currentEffort / totalEffort;
                }
            }
        }
    }

    regenerateNotifications() {
        const journals = this.getJournals();
        
        journals.forEach(journal => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'social',
                'press',
                'all',
                journal.id,
                journal.isUnlocked && !journal.isCapped
            );
        });
    }

    tick(game, delta) {
        if(!this.isPressUnlocked()) return;
        this.applyEffort(delta);
    }

    save() {
        return {
            journals: this.journals,
            effortAssign: this.effortAssign,
        }
    }

    load(saveObject) {
        if(!saveObject) {
            this.reset();
            return;
        }

        this.reset();
        
        this.journals = saveObject.journals || {};
        this.effortAssign = saveObject.effortAssign || {};
        
        // Sync levels from saved data to entities
        for (const journalId in this.journals) {
            if (gameEntity.entityExists(journalId)) {
                const savedLevel = this.journals[journalId].level || 1;
                gameEntity.setEntityLevel(journalId, savedLevel, true);
            }
        }
    }

    reset() {
        for (const journalId in this.journals) {
            if (gameEntity.entityExists(journalId)) {
                gameEntity.setEntityLevel(journalId, 1, true);
            }
        }
        this.journals = {};
        this.effortAssign = {};
    }
}
