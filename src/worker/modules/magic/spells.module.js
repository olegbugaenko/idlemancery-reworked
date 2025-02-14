import {gameEntity, gameResources, resourceApi, resourceCalculators, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {getCostReduction, getMasteryId, getMaxId, initSpellsDB1} from "./spells-db";
import {checkMatchingRules} from "../../shared/utils/rule-utils";

export class SpellModule extends GameModule {

    constructor() {
        super();
        this.spells = {};
        this.isUnlocked = false;
        this.autoConsumeCD = 2;
        this.eventHandler.registerHandler('use-spell', (payload) => {
            this.useSpell(payload.id, payload.amount);
        })
        this.eventHandler.registerHandler('query-spell-data', (payload) => {
            this.sendSpellData(payload)
        })

        this.eventHandler.registerHandler('query-spell-details', (payload) => {
            this.sendSpellDetails(payload.id)
        })

        this.eventHandler.registerHandler('save-spell-settings', payload => {
            this.saveSettings(payload)
        })

        this.eventHandler.registerHandler('get-spell-level-effects', payload => {
            const effects = this.querySpellEffects(payload.id, payload.level);
            this.eventHandler.sendData('spell-level-effects', effects);
        })
    }

    initialize() {

        initSpellsDB1();

    }

    isSpellLevelingAvailable() {
        return gameEntity.getLevel('shop_item_spellcraft') > 0;
    }

    getMaxXP(id, level) {
        if(!level) {
            level = this.spells[id]?.level || 1;
        }
        const mx = gameEntity.getAttribute(id, 'baseXPCost', 100);
        return mx*Math.pow(3, level)
    }

    getXPPerCast(id, level) {
        if(!level) {
            level = this.spells[id]?.actualLevel || 1;
        }
        const sp = gameEntity.getAttribute(id, 'xpOnCast', 0);

        return sp*Math.pow(1.4, level)*gameEffects.getEffectValue('spell_xp_rate')*Math.pow(1.025, gameEffects.getEffectValue('attribute_spell_reading'));
    }

    tick(game, delta) {
        this.autoConsumeCD -= delta;

        // trigger autocast
        for(const itemId in this.spells) {
            this.spells[itemId].isCasted = false;

            if(this.spells[itemId].duration > 0) {
                // console.log('SPELL: ', itemId, this.spells[itemId].duration);
                this.spells[itemId].duration -= delta;
                if(gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.setAttribute(`active_${itemId}`, 'current_duration', this.spells[itemId].duration);
                }
            }
            if(this.spells[itemId].duration <= 0 && this.spells[itemId].isRunning) {
                this.spells[itemId].duration = 0;
                this.spells[itemId].isRunning = false;
                this.spells[itemId].cooldown = gameEntity.getEntity(itemId).getUsageCooldown() ?? 0;
                console.log('Set cooldown of '+itemId, this.spells[itemId].cooldown);
                if(gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.unsetEntity(`active_${itemId}`);
                }
            }

            if(this.spells[itemId].cooldown > 0) {
                this.spells[itemId].cooldown -= delta;
            }

            if(this.autoConsumeCD > 0) {
                continue;
            }
            if(!this.spells[itemId]?.autocast?.isEnabled) {
                continue;
            }

            // check if matching rules
            const isMatching = checkMatchingRules(this.spells[itemId]?.autocast?.rules, this.spells[itemId]?.autocast?.pattern);

            // console.log('RULES MATCHED: ', isMatching);
            if(isMatching && (this.spells[itemId]?.cooldown || 0) <= 0) {
                this.useSpell(itemId, 1);
            }

        }

        if(this.autoConsumeCD <= 0) {
            this.autoConsumeCD = 1;
        }
    }

    save() {
        return {
            spells: this.spells,
        }
    }

    load(saveObject) {
        
        for(const key in this.purchasedItems) {
            this.setSpell(key, 0, true);
            gameEntity.setEntityLevel(getMaxId(id), 0, true);
        }
        this.spells = {};
        if(saveObject?.spells) {
            for(const id in saveObject.spells) {
                this.spells[id] = saveObject.spells[id];
                if(!this.spells[id].level) {
                    this.spells[id].level = 1;
                }
                if(!this.spells[id].actualLevel) {
                    this.spells[id].actualLevel = 1;
                    this.spells[id].xp = 0;
                }
                gameEntity.setEntityLevel(getMaxId(id), this.spells[id].level-1, true);
                this.setSpell(id, saveObject.spells[id].actualLevel || 1, true);
                this.spells[id].duration = saveObject.spells[id].duration;
                if(this.spells[id].duration && this.spells[id].duration > 0) {
                    this.spells[id].isRunning = true;
                    gameEntity.registerGameEntity(`active_${id}`, {
                        copyFromId: id,
                        isAbstract: false,
                        tags: ['active_spell', 'active_effect'],
                        scope: 'spells',
                        level: saveObject.spells[id].actualLevel,
                    });
                }
            }
        }
        this.isUnlocked = saveObject?.isUnlocked || false;
        this.sendSpellData();
    }

    reset() {
        this.load({});
    }

    setSpell(spellId, amount, bForce = false) {
        if(amount < 1) amount = 1;
        if(amount > this.spells[spellId].level) {
            amount = this.spells[spellId].level;
        }
        gameEntity.setEntityLevel(spellId, amount, bForce);
        this.spells[spellId].actualLevel = gameEntity.getLevel(spellId);
    }

    getConsumeAffordable(entity, level) {
        let result = {
            isAffordable: true,
            consume: {}
        }
        if(!level) {
            level = entity.level;
        }
        if(entity.usageGain) {
            const effects = resourceApi.unpackEffects(entity.usageGain, level);
            if(effects.length) {
                const rsToRemove = effects.filter(eff => eff.scope === 'consumption' && eff.type === 'resources');
                
                rsToRemove.forEach(rs => {
                    result.consume[rs.id] = rs.value; // *this.getSpellMaxLvlDiscount(entity.id);
                    if(result.consume[rs.id] > gameResources.getResource(rs.id).amount) {
                        result.isAffordable = false;
                    }
                })
            }

        }
        return result;
    }

    getSpellMaxLvlDiscount(id) {
        return Math.pow(0.975, this.spells[id]?.level || 0);
    }

    useSpell(id) {
        const spell = gameEntity.getEntity(id);

        if(!this.spells[id]) {
            this.spells[id] = {
                duration: 0,
                cooldown: 0,
                level: 1,
                actualLevel: 1,
                numCasted: 0,
                xp: 0
            }
        }

        if((this.spells[id]?.duration || 0) > 0) {
            return;
        }

        if((this.spells[id]?.cooldown || 0) > 0) {
            return;
        }

        if(spell.usageGain) {
            const aff = this.getConsumeAffordable(spell);
            if (!aff.isAffordable) {
                return;
            }
        }

        this.spells[id].isRunning = true;
        this.spells[id].duration = 0;

        if(this.isSpellLevelingAvailable()) {

            const dXP = this.getXPPerCast(id);

            this.spells[id].xp += dXP;
            if(this.spells[id].xp >= this.getMaxXP(id)) {
                this.spells[id].xp = 0;
                // level-up spell
                this.spells[id].level++;
                gameEntity.setEntityLevel(getMaxId(id), this.spells[id].level-1, true);
            }
        }
        
        if(spell.usageGain) {
            const aff = this.getConsumeAffordable(spell);
            if(!aff.isAffordable) {
                return;
            }

            const effects = resourceApi.unpackEffects(spell.usageGain, spell.level);
            if(effects.length) {
                const rsToAdd = effects.filter(eff => eff.scope === 'income' && eff.type === 'resources');

                rsToAdd.forEach(rs => {
                    gameResources.addResource(rs.id, rs.value);
                })
            }

            for(const key in aff.consume) {
                gameResources.addResource(key, -aff.consume[key]);
            }

            if(gameEntity.getAttribute(spell.id, 'duration')) {
                gameEntity.registerGameEntity(`active_${id}`, {
                    copyFromId: id,
                    isAbstract: false,
                    level: spell.level,
                    tags: ['active_spell', 'active_effect'],
                    scope: 'spells'
                });

                gameEntity.setEntityLevel(`active_${id}`, spell?.level ?? 1);
                this.spells[id].duration = gameEntity.getAttribute(spell.id, 'duration');
            }

            if(!this.spells[id]) {
                this.spells[id] = {};
            }
            this.spells[id].isCasted = true;
            this.spells[id].numCasted = (this.spells[id].numCasted || 0) + 1;

        }
        this.sendSpellData();
    }

    saveSettings(payload) {
        if(payload.id) {
            // check if level was changed
            if(!this.spells[payload.id]) {
                this.spells[payload.id] = {
                    duration: 0,
                    cooldown: 0,
                    level: 1,
                    actualLevel: 1,
                    xp: 0
                }
            }
            if(payload.actualLevel && payload.actualLevel !== this.spells[payload.id].actualLevel) {
                this.setSpell(payload.id, payload.actualLevel, true);
            }

            this.spells[payload.id] = {
                ...(this.spells[payload.id] || {}),
                autocast: payload.autocast,
            }
        }
    }

    regenerateNotifications() {

        const entities = gameEntity.listEntitiesByTags(['spell']);

        entities.forEach(item => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'spellbook',
                'spellbook',
                'all',
                `spell_${item.id}`,
                item.isUnlocked
            )
        })
    }

    getSpellsData(payload) {
        const items = gameEntity.listEntitiesByTags(['spell']);
        let presentSpells = items.filter(item => item.isUnlocked);

        if(payload?.filterAutomated) {
            presentSpells = presentSpells.filter(one => this.spells[one.id]?.autocast?.rules?.length || this.spells[one.id]?.autocast?.isEnabled)
        }

        if(payload?.includeAutomations) {
            presentSpells = presentSpells.map(spell => ({
                ...spell,
                autocast: this.spells[spell.id]?.autocast,
            }))
        }
        
        return {
            available: presentSpells.map(spell => ({
                ...spell,
                currentDuration: this.spells[spell.id]?.duration,
                isActive: this.spells[spell.id]?.duration > 0,
                isCasted: this.spells[spell.id]?.isCasted,
                cooldown: this.spells[spell.id]?.cooldown ?? 0,
                cooldownProg: spell.getUsageCooldown ? (spell.getUsageCooldown() - (this.spells[spell.id]?.cooldown ?? 0)) / spell.getUsageCooldown() : 1
            })),
            isSpellLevelingAvailable: this.isSpellLevelingAvailable(),
            automationUnlocked: gameEntity.getLevel('shop_item_planner') > 0,
        }
    }

    sendSpellData(payload) {
        const data = this.getSpellsData(payload);
        let label = 'spell-data';
        if(payload?.prefix) {
            label = `${label}-${payload.prefix}`;
        }
        this.eventHandler.sendData(label, data);
    }

    querySpellEffects(id, level) {
        const spell =  gameEntity.getEntity(id);
        let effects = [];
        if(spell.usageGain) {
            effects = resourceApi.unpackEffects(spell.usageGain, level)
        }

        return {
            effects,
            potentialEffects: gameEntity.getEffects(id, 0, level, true),
            affordable: resourceCalculators.isAffordable(this.getConsumeAffordable(spell, level).consume),
            xpRate: this.getXPPerCast(id, level)
        }
    }

    getSpellDetails(id) {
        if(!id) return null;
        const spell =  gameEntity.getEntity(id);
        let effects = [];
        if(spell.usageGain) {
            effects = resourceApi.unpackEffects(spell.usageGain, spell.level)
        }

        return {
            id: spell.id,
            name: spell.name,
            description: spell.description,
            breakdown: spell.breakdown,
            amount: spell.amount,
            effects,
            duration: gameEntity.getAttribute(id, 'duration'),
            currentDuration: this.spells[id]?.duration,
            potentialEffects: gameEntity.getEffects(id, 0, spell.level, true),
            affordable: resourceCalculators.isAffordable(this.getConsumeAffordable(spell).consume),
            tags: spell.tags || [],
            autocast: this.spells[id]?.autocast ?? { rules: [] },
            isCasted: this.spells[id]?.isCasted,
            maxLevel: this.spells[id]?.level || 1,
            maxLevelCostReduction: getCostReduction(id),
            maxXP: this.getMaxXP(id),
            xp: this.spells[id]?.xp || 0,
            xpRate: this.getXPPerCast(id),
            actualLevel: spell.level,
            isSpellLevelingAvailable: this.isSpellLevelingAvailable(),
            cooldown: spell.getUsageCooldown(),
        }
    }

    sendSpellDetails(id) {
        const data = this.getSpellDetails(id);
        this.eventHandler.sendData('spell-details', data);
    }

}