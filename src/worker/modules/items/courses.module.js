import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {charismaMod, registerShopItemsStage1} from "./shop-db";
import {sellPriceMod} from "../inventory/inventory-items-db";
import {registerCourseItemsStage1} from "./courses-db";

export class CoursesModule extends GameModule {

    constructor() {
        super();
        this.courses = {};
        this.leveledId = null;
        this.purchaseMultiplier = 1;
        this.runningCourse = null;
        this.eventHandler.registerHandler('set-course-autopurchase', ({ id, flag }) => {
            const entities = gameEntity.listEntitiesByTags(['course']).filter(one => one.isUnlocked && !one.isCapped);
            entities.forEach(e => {
                if(!id || id === e.id) {
                    this.autoPurchase[e.id] = flag;
                }
            })
            this.sendItemsData();
        })
        this.eventHandler.registerHandler('run-course', (payload) => {
            this.runCourse(payload.id);
        })
        this.eventHandler.registerHandler('stop-course', (payload) => {
            this.stopCourse(payload.id);
        })
        this.eventHandler.registerHandler('query-course-data', (payload) => {
            this.sendItemsData()
        })

        this.eventHandler.registerHandler('query-course-details', (payload) => {
            this.sendItemDetails(payload.id)
        })


    }

    initialize() {


        registerCourseItemsStage1();

    }

    getDuration(id) {
        const base = gameEntity.getAttribute(id, 'basicDuration');

        const level = this.courses[id]?.level ?? 0;

        return base * Math.pow(1.25, level) / gameEffects.getEffectValue('courses_learning_speed');
    }

    tick(game, delta) {
        this.leveledId = null;

        if(this.runningCourse) {
            const learningEntity = gameEntity.getEntity(`learning_${this.runningCourse}`);

            const eff = gameEntity.getEntityEfficiency(learningEntity.id);

            this.courses[this.runningCourse].progress += delta*eff;

            if(this.courses[learningEntity.attributes.learningEntityId].progress > this.getDuration(this.runningCourse)) {
                this.setItem(
                    this.runningCourse,
                    {
                        progress: 0,
                        level: this.courses[this.runningCourse].level + 1,
                        autoResume: this.courses[this.runningCourse].autoResume,
                    },
                    true
                );
                console.log('Leveled Running Course: ', this.courses[this.runningCourse]);
                gameEntity.setEntityLevel(`learning_${this.runningCourse}`, this.courses[this.runningCourse].level, true);
                this.leveledId = this.runningCourse;
            }
        }

    }

    save() {
        return {
            courses: this.courses,
            runningCourse: this.runningCourse,
        }
    }

    load(saveObject) {
        if(this.runningCourse) {
            this.stopCourse();
        }

        for(const key in this.courses) {
            this.setItem(key, {
                level: 0,
                progress: 0,
                autoResume: false,
            }, true);
        }
        this.courses = {};
        if(saveObject?.courses) {
            for(const id in saveObject.courses) {
                this.setItem(id, saveObject.courses[id], true);
            }
        }

        if(saveObject?.runningCourse) {
            this.runCourse(saveObject.runningCourse);
        }

        this.sendItemsData();
    }

    reset() {
        this.load({});
    }

    setItem(itemId, course, bForce = false) {
        gameEntity.setEntityLevel(itemId, course.level, bForce);
        this.courses[itemId] = {
            level: gameEntity.getLevel(itemId),
            progress: course.progress,
            autoResume: course.autoResume,
        }
    }

    runCourse(itemId) {
        const course = gameEntity.getEntity(itemId);
        if(!course.learningEntity) return;

        if(this.runningCourse) {
            this.stopCourse(this.runningCourse);
        }

        const learningEntity = gameEntity.registerGameEntity(`learning_${itemId}`, {...course.learningEntity});
        gameEntity.setEntityLevel(learningEntity.id, course.level, true);

        if(!this.courses[itemId]) {
            this.courses[itemId] = {
                level: course.level,
                progress: 0,
                autoResume: false,
            };
        }

        this.runningCourse = itemId;
    }

    stopCourse(itemId) {
        if(!this.runningCourse) return;
        if(itemId && this.runningCourse !== itemId) return;

        const learningEntity = gameEntity.getEntity(`learning_${this.runningCourse}`);

        gameEntity.unsetEntity(learningEntity.id);

        this.runningCourse = null;
    }

    regenerateNotifications() {
        // NOW - check for actions if they have any new notifications
        const entities = gameEntity.listEntitiesByTags(['course']);

        entities.forEach(entity => {
            gameCore.getModule('unlock-notifications').registerNewNotification(
                'shop',
                'courses',
                'all',
                `course_${entity.id}`,
                entity.isUnlocked && !entity.isCapped
            )
        })

    }


    getItemsData() {
        const entities = gameEntity.listEntitiesByTags(['course']);
        return {
            available: entities.filter(one => one.isUnlocked && !one.isCapped).map(entity => ({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                max: gameEntity.getEntityMaxLevel(entity.id),
                level: this.courses[entity.id]?.level || 0,
                affordable: gameEntity.getAffordable(entity.id),
                potentialEffects: gameEntity.getEffects(entity.id, 1),
                isLeveled: this.leveledId === entity.id,
                isAutoResume: this.courses[entity.id]?.autoResume ?? false,
                progress: this.courses[entity.id]?.progress,
                maxProgress: this.getDuration(entity.id),
                isRunning: gameEntity.entityExists(`learning_${entity.id}`),
                learningEffects: resourceApi.unpackEffects(entity.learningEntity.resourceModifier || {}, entity.level),
                efficiency: gameEntity.entityExists(`learning_${entity.id}`) ? gameEntity.getEntityEfficiency(`learning_${entity.id}`) : 1,
                toNext: gameEntity.entityExists(`learning_${entity.id}`) ? (this.getDuration(entity.id) - this.courses[entity.id]?.progress)/(gameEntity.getEntityEfficiency(`learning_${entity.id}`) + 1.e-8) : 0,
            })),
        }
    }

    sendItemsData() {
        const data = this.getItemsData();
        this.eventHandler.sendData('course-data', data);
    }

    getItemDetails(id) {
        if(!id) return null;
        const entity = gameEntity.getEntity(id);
        const entityData = {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            max: gameEntity.getEntityMaxLevel(entity.id),
            level: this.courses[entity.id]?.level || 0,
            affordable: gameEntity.getAffordable(entity.id),
            potentialEffects: gameEntity.getEffects(entity.id, 1),
            currentEffects: gameEntity.getEffects(entity.id),
            tags: entity.tags,
            isAutoResume: this.courses[entity.id]?.autoResume ?? false,
            progress: this.courses[entity.id]?.progress,
            maxProgress: this.getDuration(entity.id),
            isRunning: gameEntity.entityExists(`learning_${entity.id}`),
            learningEffects: resourceApi.unpackEffects(entity.learningEntity.resourceModifier || {}, entity.level),
            entityEfficiency: gameEntity.entityExists(`learning_${entity.id}`) ? gameEntity.getEntityEfficiency(`learning_${entity.id}`) : 1,
        }

        if(entityData.entityEfficiency < 1) {
            entityData.missingResource = gameResources.getResource(gameEntity.getEntity(`learning_${entity.id}`)?.modifier?.bottleNeck);
        }

        return entityData;
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }


}