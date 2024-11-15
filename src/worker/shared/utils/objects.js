export const packEffects = (effects, filter = (item) => true) => {
    const result = effects.filter(filter).reduce((acc, item) => {
        acc[item.id] = item;

        return acc;
    }, {})

    return result;
}