import {useSyncExternalStoreWithSelector} from 'react';

const defaultState = {
    available: [],
    current: undefined,
    actionCategories: [],
    actionLists: [],
    automationEnabled: false,
    automationUnlocked: false,
    actionListsUnlocked: false,
    runningList: null,
    searchData: {
        search: '',
        selectedScopes: ['name', 'tags'],
    },
    selectedCategory: 'all',
    stats: {},
    aspects: {
        isUnlocked: false,
        list: [],
    },
    customFilters: {},
    customFiltersOrder: [],
    showHidden: false,
    showMaxed: false,
    autotriggerIntervalSetting: 0,
};

let state = defaultState;
const listeners = new Set();

const getSnapshot = () => state;

const emitChange = () => {
    listeners.forEach(listener => listener());
};

export const subscribeActionsStore = (listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const getActionsSnapshot = () => state;

export const updateActionsState = (partialState = {}) => {
    if (!partialState || typeof partialState !== 'object') {
        return;
    }

    const prevState = state;
    let hasChanges = false;
    const nextState = { ...prevState };

    for (const [key, value] of Object.entries(partialState)) {
        if (!Object.is(prevState[key], value)) {
            nextState[key] = value;
            hasChanges = true;
        }
    }

    if (!hasChanges) {
        return;
    }

    state = nextState;
    emitChange();
};

export const resetActionsState = () => {
    state = defaultState;
    emitChange();
};

const identity = (value) => value;

export const useActionsData = (selector = identity, isEqual = Object.is) => {
    return useSyncExternalStoreWithSelector(
        subscribeActionsStore,
        getSnapshot,
        getSnapshot,
        selector,
        isEqual
    );
};

export const getDefaultActionsState = () => defaultState;
