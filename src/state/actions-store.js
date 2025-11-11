import {useEffect, useRef, useState} from 'react';

const isPlainObject = (value) => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

const mergeValue = (previous, next) => {
    if (Object.is(previous, next)) {
        return previous;
    }

    if (Array.isArray(next)) {
        return mergeArray(Array.isArray(previous) ? previous : undefined, next);
    }

    if (isPlainObject(next)) {
        return mergeObject(isPlainObject(previous) ? previous : undefined, next);
    }

    return next;
};

const mergeObject = (previous = {}, next = {}) => {
    if (Object.is(previous, next)) {
        return previous;
    }

    let hasChanges = false;
    const merged = {};
    const nextKeys = Object.keys(next);

    for (const key of nextKeys) {
        const mergedValue = mergeValue(previous?.[key], next[key]);
        merged[key] = mergedValue;

        if (!Object.is(mergedValue, previous?.[key])) {
            hasChanges = true;
        }
    }

    if (!hasChanges && Object.keys(previous ?? {}).length === nextKeys.length) {
        return previous;
    }

    return merged;
};

const getItemKey = (value) => {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    if ('id' in value) return value.id;
    if ('key' in value) return value.key;
    if ('uid' in value) return value.uid;
    if ('slug' in value) return value.slug;
    if ('name' in value) return value.name;

    return undefined;
};

const mergeArray = (previous = [], next = []) => {
    if (Object.is(previous, next)) {
        return previous;
    }

    if (!Array.isArray(next)) {
        return next;
    }

    const hadPrevious = Array.isArray(previous);
    let hasChanges = !hadPrevious || previous.length !== next.length;
    const merged = new Array(next.length);
    const previousByKey = new Map();

    if (hadPrevious) {
        for (const item of previous) {
            const key = getItemKey(item);
            if (key !== undefined && !previousByKey.has(key)) {
                previousByKey.set(key, item);
            }
        }
    }

    for (let index = 0; index < next.length; index += 1) {
        const nextValue = next[index];
        const key = getItemKey(nextValue);
        const fallbackPrev = hadPrevious ? previous[index] : undefined;
        const matchedPrev = key !== undefined && previousByKey.has(key)
            ? previousByKey.get(key)
            : fallbackPrev;
        const value = mergeValue(matchedPrev, nextValue);
        merged[index] = value;

        if (!hadPrevious || !Object.is(value, fallbackPrev)) {
            hasChanges = true;
        }
    }

    if (!hasChanges && hadPrevious) {
        return previous;
    }

    return merged;
};

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
        const mergedValue = mergeValue(prevState[key], value);

        if (!Object.is(prevState[key], mergedValue)) {
            nextState[key] = mergedValue;
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
