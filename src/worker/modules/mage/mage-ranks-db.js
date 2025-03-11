import {gameEntity} from "game-framework";




export const initMageRanks = () => {

    gameEntity.registerGameEntity('mage_rank', {
        id: 'mage_rank',
        name: 'Mage Rank',
        level: 0,
        resourceModifier: {
            income: {
                resources: {
                    'skill-points': {
                        A: 1,
                        B: 0,
                        type: 0
                    }
                }
            }
        }
    })

    return [{
        id: 'rank0',
        level: 0,
        name: 'Rank0',
        rankLevel: 1,
    },{
        id: 'rank1',
        level: 5,
        name: 'Rank1',
        rankLevel: 2,
    },{
        id: 'rank2',
        level: 10,
        name: 'Rank2',
        rankLevel: 3,
    },{
        id: 'rank3',
        level: 20,
        name: 'Rank3',
        rankLevel: 4,
    },{
        id: 'rank4',
        level: 30,
        name: 'Rank4',
        rankLevel: 5,
    }]
}