import {useState} from "react";

export function useUICache(cacheId, defaultValue) {

    const [value, setValue] = useState(null);
    const cacheData = JSON.parse(localStorage.getItem(`cache`) || '{}');

    const stored = (cacheId in cacheData) ? cacheData[cacheId] : defaultValue;

    return [
        value ?? stored,
        (value) => {
            let cache = JSON.parse(localStorage.getItem(`cache`) || '{}');
            if(!cache) {
                cache = {};
            }
            cache[cacheId] = value;
            setValue(value);
            localStorage.setItem('cache', JSON.stringify(cache));
        }
    ]
}

export function cleanLocalCache() {
    localStorage.removeItem('cache');
}