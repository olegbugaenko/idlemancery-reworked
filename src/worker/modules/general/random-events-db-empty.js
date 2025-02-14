import {gameCore, gameEntity, gameResources} from "game-framework";

export const randomEventScalingFactor = (id) => {
    const level = gameEntity.getLevel(id);
    let result = Math.pow(1 + level, 1.5)
    if(level > 100) {
        result *= Math.pow(1.03, level);
    }
    return result;
}

export const registerRandomEventsEmptyDb = () => {

    const randomEventsDB = [];


    return randomEventsDB;
};
