import {GameModule} from "../../shared/game-module";
import {achievementsDb} from "./achievements-db";
import {gameCore} from "game-framework";

export class AchievementsModule extends GameModule {

    constructor() {
        super();
        this.achievementsDone = {}
        this.checkTimeout = 0;

        this.eventHandler.registerHandler('mark-achievement-viewed', (payload => {
            if(this.achievementsDone[payload.id]?.s === 1) {
                this.achievementsDone[payload.id].s = 2; // viewed
                if(payload.id === 'intro') {
                    this.eventHandler.sendData('tour_status', {...gameCore.getModule('mage').tourStatus, isAllowed: true});
                }
                this.eventHandler.sendData('achievement-to-view', undefined);
            }
        }))

        this.eventHandler.registerHandler('query-achievement-to-view', (payload => {
            if(gameCore.getModule('mage').settings?.hideStoryPopup) {
                this.eventHandler.sendData('achievement-to-view', undefined);
                return;
            }
            const toViewId = Object.entries(this.achievementsDone).find(([id, {s}]) => s === 1);
            this.eventHandler.sendData('achievement-to-view', toViewId ? this.achievementsDB.find(a => a.id ===  toViewId[0]) : undefined);
        }))

        this.eventHandler.registerHandler('query-completed-achievements', (payload => {
            this.sendCompleted();
        }))
    }

    initialize() {
        this.achievementsDB = achievementsDb.filter(one => {
            if(!gameCore.demoVersion) return true;
            return !one.minDemoVersion || (gameCore.demoVersion >= one.minDemoVersion);
        });
    }

    save() {
        return {
            done: this.achievementsDone,
        }
    }

    load(obj) {
        this.achievementsDone = obj?.done ?? {};
        this.checkTimeout = 0;
    }

    reset() {
        this.load(undefined);
    }

    tick(game, dT) {
        this.checkTimeout -= dT;
        if(this.checkTimeout <= 0) {
            this.checkTimeout = 10;
            const toCheck = this.achievementsDB.filter(one => !(one.id in this.achievementsDone));
            toCheck.forEach(one => {
                if(one.completeCondition()) {
                    this.achievementsDone[one.id] = {
                        s: 1,
                        d: (new Date()).toString(),
                    }; // Done not viewed
                }
            })
        }
    }

    listCompleted() {
        return this.achievementsDB.filter(a => this.achievementsDone[a.id]?.s > 0).map(a => ({
            ...a,
            completedAt: this.achievementsDone[a.id].d,
        }))
    }

    sendCompleted() {
        const list = this.listCompleted().sort((a, b) => a.completedAt > b.completedAt ? -1 : 1);
        this.eventHandler.sendData('completed-achievements', { list })
    }

}