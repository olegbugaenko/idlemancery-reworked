import React, { useContext, useEffect, useState } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { formatInt, formatValue } from "../../general/utils/strings";
import PerfectScrollbar from "react-perfect-scrollbar";
import { TippyWrapper } from "./tippy-wrapper.jsx";
import { CustomButton } from "./buttons/custom-button.jsx";

export const QuickAccessPanel = () => {
    const worker = useContext(WorkerContext);
    const { onMessage, sendData } = useWorkerClient(worker);

    const [favorites, setFavorites] = useState({
        actions: [],
        actionLists: [],
        craftingLists: [],
        alchemyLists: [],
        courses: [],
        guilds: [],
        socialEvents: []
    });

    const [favoritesData, setFavoritesData] = useState({
        actions: {},
        actionLists: {},
        craftingLists: {},
        alchemyLists: {},
        courses: {},
        guilds: {},
        socialEvents: {}
    });

    useEffect(() => {
        sendData('query-favorites', {});
        sendData('query-favorite-items', {});

        const interval = setInterval(() => {
            sendData('query-favorites', {});
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    onMessage('favorites', (data) => {
        setFavorites(data);
    });

    onMessage('favorite-items', (data) => {
        setFavoritesData(data);
    });

    const runAction = (id) => {
        sendData('run-action', { id, isForce: true });
    };

    const runActionList = (id) => {
        sendData('run-list', { id });
    };

    const runCraftingList = (id, category) => {
        sendData('run-crafting-list', { id, category });
    };

    const runCourse = (id) => {
        sendData('run-course', { id });
    };

    const removeFavorite = (type, id) => {
        sendData('remove-favorite', { type, id });
    };

    const renderActionItem = (action) => (
        <div key={action.id} className="quick-access-item">
            <div className="item-content">
                <span className="item-name">{action.name}</span>
                <span className="level">{formatValue(action.level)}</span>
            </div>
            <div className="item-actions">
                <CustomButton
                    onClick={() => runAction(action.id)}
                    iconId="run"
                    className="icon-content interface-icon small clickable-icon"
                >
                    Run
                </CustomButton>
                <span onClick={() => removeFavorite('actions', action.id)} className="remove-btn">×</span>
            </div>
        </div>
    );

    const renderActionListItem = (list) => (
        <div key={list.id} className="quick-access-item">
            <div className="item-content">
                <span className="item-name">{list.name}</span>
            </div>
            <div className="item-actions">
                <CustomButton
                    onClick={() => runActionList(list.id)}
                    iconId="run"
                    className="icon-content interface-icon small clickable-icon"
                >
                    Run
                </CustomButton>
                <span onClick={() => removeFavorite('actionLists', list.id)} className="remove-btn">×</span>
            </div>
        </div>
    );

    const renderCraftingListItem = (list, category) => (
        <div key={list.id} className="quick-access-item">
            <div className="item-content">
                <span className="item-name">{list.name}</span>
            </div>
            <div className="item-actions">
                <CustomButton
                    onClick={() => runCraftingList(list.id, category)}
                    iconId="run"
                    className="icon-content interface-icon small clickable-icon"
                >
                    Run
                </CustomButton>
                <span onClick={() => removeFavorite(category === 'crafting' ? 'craftingLists' : 'alchemyLists', list.id)} className="remove-btn">×</span>
            </div>
        </div>
    );

    const renderCourseItem = (course) => (
        <div key={course.id} className="quick-access-item">
            <div className="item-content">
                <div className="icon-content">
                    <img src={`icons/courses/${course.id}.png`} className="resource" />
                    <span className="level">{formatValue(course.level)}</span>
                </div>
                <span className="item-name">{course.name}</span>
            </div>
            <div className="item-actions">
                <CustomButton
                    onClick={() => runCourse(course.id)}
                    iconId="run"
                    className="icon-content interface-icon small clickable-icon"
                >
                    Run
                </CustomButton>
                <span onClick={() => removeFavorite('courses', course.id)} className="remove-btn">×</span>
            </div>
        </div>
    );

    return (
        <div className="quick-access-panel">
            <PerfectScrollbar>
                <div className="quick-access-sections">
                    {favorites.actions.length > 0 && (
                        <div className="quick-access-section">
                            <h4>Favorite Actions</h4>
                            <div className="items-list">
                                {favorites.actions.map(id => {
                                    const action = favoritesData.actions[id];
                                    return action ? renderActionItem(action) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {favorites.actionLists.length > 0 && (
                        <div className="quick-access-section">
                            <h4>Favorite Action Lists</h4>
                            <div className="items-list">
                                {favorites.actionLists.map(id => {
                                    const list = favoritesData.actionLists[id];
                                    return list ? renderActionListItem(list) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {favorites.craftingLists.length > 0 && (
                        <div className="quick-access-section">
                            <h4>Favorite Crafting Lists</h4>
                            <div className="items-list">
                                {favorites.craftingLists.map(id => {
                                    const list = favoritesData.craftingLists[id];
                                    return list ? renderCraftingListItem(list, 'crafting') : null;
                                })}
                            </div>
                        </div>
                    )}

                    {favorites.alchemyLists.length > 0 && (
                        <div className="quick-access-section">
                            <h4>Favorite Alchemy Lists</h4>
                            <div className="items-list">
                                {favorites.alchemyLists.map(id => {
                                    const list = favoritesData.alchemyLists[id];
                                    return list ? renderCraftingListItem(list, 'alchemy') : null;
                                })}
                            </div>
                        </div>
                    )}

                    {favorites.courses.length > 0 && (
                        <div className={'favorites-section'}>
                            <h4>Favorite Courses</h4>
                            {favorites.courses.map(id => {
                                const course = favoritesData.courses[id];
                                return course ? (
                                    <div key={id} className={'favorite-item'}>
                                        <span className="item-name">{course.name}</span>
                                        <span onClick={() => removeFavorite('courses', id)} className="remove-btn">×</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}

                    {favorites.guilds.length > 0 && (
                        <div className={'favorites-section'}>
                            <h4>Favorite Guilds</h4>
                            {favorites.guilds.map(id => {
                                const guild = favoritesData.guilds[id];
                                return guild ? (
                                    <div key={id} className={'favorite-item'}>
                                        <span className="item-name">{guild.name}</span>
                                        <span onClick={() => removeFavorite('guilds', id)} className="remove-btn">×</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}

                    {favorites.socialEvents.length > 0 && (
                        <div className={'favorites-section'}>
                            <h4>Favorite Social Events</h4>
                            {favorites.socialEvents.map(id => {
                                const event = favoritesData.socialEvents[id];
                                return event ? (
                                    <div key={id} className={'favorite-item'}>
                                        <span className="item-name">{event.name}</span>
                                        <span onClick={() => removeFavorite('socialEvents', id)} className="remove-btn">×</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}

                    {Object.values(favorites).every(arr => arr.length === 0) && (
                        <div className="empty-state">
                            <p>No favorites added yet.</p>
                            <p>Add items to favorites using the star icon (★) next to actions, lists, and courses.</p>
                        </div>
                    )}
                </div>
            </PerfectScrollbar>
        </div>
    );
}; 