import { gameEntity, gameResources, resourceApi, resourceCalculators } from "game-framework"
import {GameModule} from "../../shared/game-module";
import {initSpellsDB1} from "./spells-db";

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
            this.sendSpellData()
        })

        this.eventHandler.registerHandler('query-spell-details', (payload) => {
            this.sendSpellDetails(payload.id)
        })

        this.eventHandler.registerHandler('save-spell-settings', payload => {
            this.saveSettings(payload)
        })
    }

    initialize() {

        initSpellsDB1();

    }

    checkMatchingRule(rule) {
        const resource = gameResources.getResource(rule.resource_id);

        if(!resource) return false;

        let compare = resource.amount;

        if(rule.value_type === 'percentage') {
            if(!resource.cap) return false;

            compare = resource.amount / resource.cap;
        }

        switch (rule.condition) {
            case 'less':
                return compare < rule.value;
            case 'less_or_eq':
                return  compare <= rule.value;
            case 'eq':
                return compare == rule.value;
            case 'grt_or_eq':
                return compare >= rule.value;
            case 'grt':
                return compare > rule.value;
        }

        return false;
    }

    checkMatchingRules(rules) {
        for(const rule of rules) {
            console.log('RULE_CHECK: ', rule)
            if(!this.checkMatchingRule(rule)) {
                return false;
            }
            console.log('RULE Matched!');
        }
        return true;
    }

    tick(game, delta) {
        this.autoConsumeCD -= delta;

        // trigger autocast
        for(const itemId in this.spells) {
            this.spells[itemId].isCasted = false;

            if(this.spells[itemId].duration > 0) {
                console.log('SPELL: ', itemId, this.spells[itemId].duration);
                this.spells[itemId].duration -= delta;
                if(gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.setAttribute(`active_${itemId}`, 'current_duration', this.spells[itemId].duration);
                }
            }
            if(this.spells[itemId].duration <= 0) {
                this.spells[itemId].duration = 0;
                if(gameEntity.entityExists(`active_${itemId}`)) {
                    gameEntity.unsetEntity(`active_${itemId}`);
                    this.spells[itemId].cooldown = gameEntity.getEntity(itemId).getUsageCooldown() ?? 0;
                }
            }

            if(this.spells[itemId].cooldown > 0) {
                this.spells[itemId].cooldown -= delta;
            }

            if(this.autoConsumeCD > 0) {
                continue;
            }
            if(!this.spells[itemId]?.autocast?.rules?.length) {
                continue;
            }

            // check if matching rules
            const isMatching = this.checkMatchingRules(this.spells[itemId]?.autocast?.rules);

            // console.log('RULES MATCHED: ', isMatching);
            if(isMatching) {
                this.useSpell(itemId, 1);
            }

        }

        if(this.autoConsumeCD <= 0) {
            this.autoConsumeCD = 2;
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
        }
        this.spells = {};
        if(saveObject?.spells) {
            for(const id in saveObject.spells) {
                this.spells[id] = saveObject.spells[id];
                if(!this.spells[id].level) {
                    this.spells[id].level = 1;
                }
                this.setSpell(id, saveObject.spells[id].level || 1, true);
                this.spells[id].duration = saveObject.spells[id].duration;
                if(this.spells[id].duration && this.spells[id].duration > 0) {
                    gameEntity.registerGameEntity(`active_${id}`, {
                        copyFromId: id,
                        isAbstract: false,
                        tags: ['active_spell', 'active_effect'],
                        scope: 'spells',
                        level: saveObject.spells[id].level,
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
        gameEntity.setEntityLevel(spellId, amount, bForce);
        this.spells[spellId].level = gameEntity.getLevel(spellId);
    }

    getConsumeAffordable(entity) {
        let result = {
            isAffordable: true,
            consume: {}
        }
        if(entity.usageGain) {
            const effects = resourceApi.unpackEffects(entity.usageGain, entity.level);
            if(effects.length) {
                const rsToRemove = effects.filter(eff => eff.scope === 'consumption' && eff.type === 'resources');
                
                rsToRemove.forEach(rs => {
                    result.consume[rs.id] = rs.value;
                    if(result.consume[rs.id] > gameResources.getResource(rs.id).amount) {
                        result.isAffordable = false;
                    }
                })
            }

        }
        return result;
    }

    useSpell(id) {
        const spell = gameEntity.getEntity(id);

        if((this.spells[id]?.duration || 0) > 0) {
            return;
        }

        if(this.spells[id].cooldown > 0) {
            return;
        }
        
        if(spell.usageGain) {
            const aff = this.getConsumeAffordable(spell);
            if(!aff.isAffordable) {
                return;
            }

            const effects = resourceApi.unpackEffects(spell.usageGain, spell.level);
            if(effects.length) {
                const rsToAdd = effects.filter(eff => eff.scope === 'income' && eff.type === 'resources');

                console.log('consAddRMAGIC: ', effects, rsToAdd, aff, spell);

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

        }
        this.sendSpellData();
    }

    saveSettings(payload) {
        if(payload.id) {
            this.spells[payload.id] = {
                autocast: payload.autocast,
            }
        }
    }

    getSpellsData() {
        const items = gameEntity.listEntitiesByTags(['spell']);
        const presentSpells = items.filter(item => item.isUnlocked);
        
        return {
            available: presentSpells.map(spell => ({
                ...spell,
                currentDuration: this.spells[spell.id]?.duration,
                isActive: this.spells[spell.id]?.duration > 0,
                isCasted: this.spells[spell.id]?.isCasted,
                cooldown: this.spells[spell.id]?.cooldown ?? 0,
                cooldownProg: spell.getUsageCooldown ? (spell.getUsageCooldown() - (this.spells[spell.id]?.cooldown ?? 0)) / spell.getUsageCooldown() : 1
            }))
        }
    }

    sendSpellData() {
        const data = this.getSpellsData();
        this.eventHandler.sendData('spell-data', data);
    }

    getSpellDetails(id) {
        if(!id) return null;
        const spell =  gameEntity.getEntity(id);
        let effects = [];
        if(spell.usageGain) {
            effects = resourceApi.unpackEffects(spell.usageGain, 1)
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
            isCasted: this.spells[id]?.isCasted
        }
    }

    sendSpellDetails(id) {
        const data = this.getSpellDetails(id);
        this.eventHandler.sendData('spell-details', data);
    }

}