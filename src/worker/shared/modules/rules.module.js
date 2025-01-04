import {GameModule} from "../game-module";
import {checkMatchingRules} from "../utils/rule-utils";

export class RulesModule extends GameModule {

    constructor() {
        super();

        this.eventHandler.registerHandler('check-rule-conditions-matched', ({ prefix, rules, pattern }) => {
            const results = checkMatchingRules(rules, pattern, true);

            this.eventHandler.sendData(`rule-conditions-matched-${prefix}`, results);
        })
    }

    initialize() {

    }

    save() {

    }

    load() {

    }

    tick() {

    }
}