export const packEffects = (effects, filter = (item) => true) => {
    const result = effects.filter(filter).reduce((acc, item) => {
        acc[`${item.id}_${item.scope}`] = item;

        return acc;
    }, {})

    return result;
}

export const mapObject = (o, cb) => {
    return Object.entries(o).reduce(((acc, [key, val]) => {
        acc[key] = cb ? cb(val) : val;
        return acc;
    }), {})
}