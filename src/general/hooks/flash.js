import { useEffect, useRef } from 'react';

export const useFlashOnLevelUp = (isLeveled, onFlash, elementRef) => {
    const prevIsLeveledRef = useRef(false);

    useEffect(() => {
        if (isLeveled && !prevIsLeveledRef.current) {
            // isLeveled змінився з false на true
            const cardElement = elementRef.current?.querySelector('.flashable') || elementRef.current;

            if (cardElement) {
                const rect = cardElement.getBoundingClientRect();
                onFlash({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
            }
        }
        // Оновлюємо попереднє значення isLeveled
        prevIsLeveledRef.current = isLeveled;
    }, [isLeveled, onFlash, elementRef]);
};
