import { useRef } from 'react';
import { useDnd } from '../context/dnd-context';

export const useDrag = (data) => {
    const { startDrag, setPreview } = useDnd();
    const ref = useRef(null);

    const handleMouseDown = (e) => {
        /*e.preventDefault();*/

        if (!data?.id) {
            console.warn('useDrag: drag data must include an `id` field');
            return;
        }

        if (!data?.sourceId) {
            console.warn('useDrag: drag data must include an `sourceId` field');
            return;
        }

        let finalIndex = data.index;

        if (typeof finalIndex !== 'number') {
            const node = ref.current;
            if (node && node.parentNode) {
                const siblings = Array.from(node.parentNode.children);
                finalIndex = siblings.indexOf(node);
            }
        }

        const node = ref.current;

        if (node) {
            // Створюємо клон і додаємо стилі
            const clone = node.cloneNode(true);
            clone.style.width = `${node.offsetWidth}px`;
            clone.style.height = `${node.offsetHeight}px`;

            setPreview(clone);
        }


        startDrag({
            ...data,
            index: finalIndex
        });
    };

    return {
        ref,
        props: {
            onMouseDown: handleMouseDown,
            style: { cursor: 'grab' }
        }
    };
};
