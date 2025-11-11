import {useEffect, useRef, useState} from 'react';

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

const ensureSelector = (selector) => {
    if (typeof selector === 'function') {
        return selector;
    }

    return identity;
};

const ensureEqualityFn = (isEqual) => {
    if (typeof isEqual === 'function') {
        return isEqual;
    }

    return Object.is;
};

export const useActionsData = (selector = identity, isEqual = Object.is) => {
    const latestSelectionRef = useRef();
    const selectorRef = useRef(() => state);
    const equalityFnRef = useRef(Object.is);

    selectorRef.current = ensureSelector(selector);
    equalityFnRef.current = ensureEqualityFn(isEqual);

    const [selection, setSelection] = useState(() => {
        const currentSelector = selectorRef.current;
        const value = currentSelector(getSnapshot());
        latestSelectionRef.current = value;
        return value;
    });

    useEffect(() => {
        const nextSelection = selectorRef.current(getSnapshot());
        if (!equalityFnRef.current(latestSelectionRef.current, nextSelection)) {
            latestSelectionRef.current = nextSelection;
            setSelection(nextSelection);
        }
    }, [selector, isEqual]);

    useEffect(() => {
        const handleChange = () => {
            const nextSelection = selectorRef.current(getSnapshot());
            if (!equalityFnRef.current(latestSelectionRef.current, nextSelection)) {
                latestSelectionRef.current = nextSelection;
                setSelection(nextSelection);
            }
        };

        const unsubscribe = subscribeActionsStore(handleChange);
        return () => {
            unsubscribe?.();
        };
    }, []);

    return selection;
};

export const getDefaultActionsState = () => defaultState;
