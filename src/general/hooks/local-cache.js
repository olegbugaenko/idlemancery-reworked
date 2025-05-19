import {useState} from "react";

export function useUICache(cacheId, defaultValue) {

    const [value, setValue] = useState(null);
    const cacheData = JSON.parse(localStorage.getItem(`cache`) || '{}');

    const stored = (cacheId in cacheData) ? cacheData[cacheId] : defaultValue;

    return [
        value ?? stored,
        (nv) => {
            if (typeof nv === 'function') {
                nv = nv(value ?? stored);
            }
            let cache = JSON.parse(localStorage.getItem(`cache`) || '{}');
            if(!cache) {
                cache = {};
            }
            cache[cacheId] = nv;
            setValue(nv);
            localStorage.setItem('cache', JSON.stringify(cache));
        }
    ]
}

export function cleanLocalCache() {
    localStorage.removeItem('cache');
}