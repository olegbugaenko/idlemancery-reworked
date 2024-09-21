export function findLastMatchedElement(arr, condition) {
    for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];

        if (condition(item)) {
            return item;
        }
    }
}