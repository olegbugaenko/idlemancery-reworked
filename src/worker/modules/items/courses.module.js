import {gameEntity, gameResources, resourceCalculators, resourceApi, gameEffects, gameCore} from "game-framework"
import {GameModule} from "../../shared/game-module";
import {charismaMod, registerShopItemsStage1} from "./shop-db";
import {sellPriceMod} from "../inventory/inventory-items-db";
import {registerCourseItemsStage1} from "./courses-db";
import {checkMatchingRules} from "../../shared/utils/rule-utils";
import { resourceResponse } from "../../shared/utils/transform/resources";

export class CoursesModule extends GameModule {

    constructor() {
        super();
        this.courses = {};
        this.leveledId = null;
        this.purchaseMultiplier = 1;
        this.runningCourse = null;
        
        // Automation fields
        this.coursesAutotrigger = [];
        this.automationEnabled = true;
        this.autotriggerCD = 0;
        this.autotriggerIntervalSetting = 10;
        this.eventHandler.registerHandler('set-course-autopurchase', ({ id, flag }) => {
            if(!this.courses[id]) {
                this.courses[id] = {
                    level: gameEntity.getLevel(id),
                    progress: 0,
                    autoResume: false,
                    automation: {
                        isEnabled: false,
                        priority: 0,
                        rules: [],
                        pattern: ''
                    }
                };
            }
            this.courses[id].automation.isEnabled = flag;
            this.sendItemsData();
        })
        
        this.eventHandler.registerHandler('save-course-automation', ({ id, automation }) => {
            if(!this.courses[id]) {
                this.courses[id] = {
                    level: gameEntity.getLevel(id),
                    progress: 0,
                    autoResume: false,
                    automation: {
                        isEnabled: false,
                        priority: 0,
                        rules: [],
                        pattern: ''
                    }
                };
            }
            console.log('SetAuto: ', id, automation);
            this.courses[id].automation = automation;
            this.regenerateCoursesPriorityMap();
            this.sendItemsData();
        })
        
        this.eventHandler.registerHandler('set-courses-automation-enabled', ({ enabled }) => {
            this.automationEnabled = enabled;
        })
        
        this.eventHandler.registerHandler('set-courses-automation-interval', ({ interval }) => {
            this.autotriggerIntervalSetting = interval;
        })
        
        this.eventHandler.registerHandler('query-courses-automation-settings', () => {
            this.sendAutomationSettings();
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

        this.eventHandler.registerHandler('query-all-courses', (payload) => {
            this.sendAllCoursesData(payload.prefix);
        })


    }

    initialize() {


        registerCourseItemsStage1();

    }

    regenerateCoursesPriorityMap() {
        const coursesBeingAutotrigger = Object.entries(this.courses)
            .filter(([id, course]) => course.automation?.isEnabled)
            .filter(([id, course]) => {
                return gameEntity.isEntityUnlocked(id);
            });

        this.coursesAutotrigger = coursesBeingAutotrigger.map(([id, course]) => ({
            id: id,
            priority: course.automation.priority ?? 0,
        })).sort((a, b) => a.priority - b.priority);
    }

    getAutotriggerCourse() {
        for(const course of this.coursesAutotrigger) {
            const courseData = this.courses[course.id];
            if(checkMatchingRules(courseData.automation.rules, courseData.automation.pattern)) {
                return course.id;
            }
        }
        return null;
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
                        automation: this.courses[this.runningCourse].automation,
                    },
                    true
                );
                gameEntity.setEntityLevel(`learning_${this.runningCourse}`, this.courses[this.runningCourse].level, true);
                this.leveledId = this.runningCourse;
            }
        }

        // Automation logic
        if(game.ticksAfterLoad < 2) {
            this.regenerateCoursesPriorityMap();
        }
        
        if(this.automationEnabled && this.coursesAutotrigger.length && this.autotriggerCD <= 0) {
            this.autotriggerCD = this.autotriggerIntervalSetting || 10;
            const autotriggerCourse = this.getAutotriggerCourse();
            
            if(autotriggerCourse && this.runningCourse !== autotriggerCourse) {
                this.runCourse(autotriggerCourse);
            }
        }
        
        this.autotriggerCD -= delta;

    }

    save() {
        return {
            courses: this.courses,
            runningCourse: this.runningCourse,
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting,
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

        this.automationEnabled = saveObject?.automationEnabled || false;
        this.autotriggerIntervalSetting = saveObject?.autotriggerIntervalSetting || 10;

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
            automation: course.automation || {
                isEnabled: false,
                priority: 0,
                rules: [],
                pattern: ''
            }
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
        const favoritesModule = gameCore.getModule('favorites');
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
                isFavorite: favoritesModule ? favoritesModule.isFavorite('courses', entity.id) : false,
                automation: this.courses[entity.id]?.automation
            })),
        }
    }

    sendItemsData() {
        const data = this.getItemsData();
        this.eventHandler.sendData('course-data', data);
    }

    sendAutomationSettings() {
        this.eventHandler.sendData('courses-automation-settings', {
            automationEnabled: this.automationEnabled,
            autotriggerIntervalSetting: this.autotriggerIntervalSetting
        });
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
            autopurchase: this.courses[entity.id]?.automation || {
                isEnabled: false,
                priority: 0,
                rules: [],
                pattern: ''
            },
            isAutomationUnlocked: true, // TODO: get from actual unlock system
        }

        if(entityData.entityEfficiency < 1) {
            entityData.missingResource = resourceResponse(gameResources.getResource(gameEntity.getEntity(`learning_${entity.id}`)?.modifier?.bottleNeck));
        }

        return entityData;
    }

    sendItemDetails(id) {
        const data = this.getItemDetails(id);
        this.eventHandler.sendData('item-details', data);
    }

    sendAllCoursesData(prefix) {
        const courses = gameEntity.listEntitiesByTags(['course'])
            .map(entity => ({
                id: entity.id,
                name: entity.name,
                level: this.courses[entity.id]?.level || 0,
                isUnlocked: gameEntity.isEntityUnlocked(entity.id)
            }));
        
        // Додаємо опцію "None" для правил автоматизації
        courses.unshift({
            id: 'none',
            name: 'None',
            level: 0,
            isUnlocked: true
        });
        
        this.eventHandler.sendData(`all-courses-${prefix}`, courses);
    }


}