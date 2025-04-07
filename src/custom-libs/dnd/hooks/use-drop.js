import { useEffect, useRef } from 'react';
import { useDnd } from '../context/dnd-context';

export const useDrop = (id, { accept, onDrop }) => {
    const { registerDropTarget, unregisterDropTarget } = useDnd();

    const onDropRef = useRef(onDrop);

    // Оновлюємо посилання на обробник, не перереєстровуємо кожного разу
    useEffect(() => {
        onDropRef.current = onDrop;
    }, [onDrop]);

    useEffect(() => {
        const handler = {
            onDrop: (...args) => onDropRef.current?.(...args),
            accept: accept,
        };

        registerDropTarget(id, handler);

        return () => {
            unregisterDropTarget(id);
        };
    }, [id, registerDropTarget, unregisterDropTarget]);
};
