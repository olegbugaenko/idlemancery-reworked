import {GameModule} from "../../shared/game-module";

export class ActionListsSubmodule extends GameModule {

    constructor() {
        super();

        this.actionsLists = {};

        this.runningList = null;

        this.eventHandler.registerHandler('save-action-list', (payload) => {
            this.saveActionList(payload);
        })

        this.eventHandler.registerHandler('load-action-list', ({ id }) => {
            this.sendListData(id);
        })

        this.eventHandler.registerHandler('run-list', ({ id }) => {
            this.runList(id);
        })

        this.eventHandler.registerHandler('stop-list', ({ id }) => {
            this.stopList(id);
        })
    }

    runList(id) {
        this.runningList = {
            id,
            name: this.actionsLists[id].name,
            actionIndex: 0,
            actionTimer: 0,
        };
    }

    stopList(id) {
        this.runningList = null;
    }

    saveActionList(payload) {
        let isNew = !payload.id;

        const list = {...payload};

        if(!list.id) {
            list.id = `${Math.random()*1000000}`
        }

        this.actionsLists[list.id] = list;
    }

    getLists() {
        return Object.values(this.actionsLists);
    }

    save() {
        return {
            list: this.actionsLists,
            runningList: this.runningList,
        }
    }

    load(obj) {
        this.actionsLists = obj?.list ?? []
        this.runningList = obj?.runningList ?? null;
    }

    tick(game, delta) {
        if(this.runningList) {
            const listToRun = this.actionsLists[this.runningList.id];
            if(!listToRun) {
                throw new Error('Invalid list to run');
            }
            let action = listToRun.actions[this.runningList.actionIndex];
            if(this.runningList.actionTimer > listToRun.actions[this.runningList.actionIndex].time) {
                this.runningList.actionTimer = 0;
                this.runningList.actionIndex++;
                if(this.runningList.actionIndex >= listToRun.actions.length) {
                    this.runningList.actionIndex = 0;
                }
                action = listToRun.actions[this.runningList.actionIndex];
                this.runningList.actionTimer += delta;
            }
            if(game.getModule('actions').runningAction !== action.id) {
                game.getModule('actions').runAction(action.id);
            }
        }
    }

    sendListData(id) {
        const data = this.actionsLists[id];

        this.eventHandler.sendData('action-list-data', data);
    }
}