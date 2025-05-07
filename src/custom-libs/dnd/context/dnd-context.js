import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import {InsertIndicator} from "../components/insertation-indicator.jsx";

const DndContext = createContext(null);

export const DndProvider = ({ children }) => {
    const [dragData, setDragData] = useState(null);
    const [dropTargets, setDropTargets] = useState(new Map());
    const [cursorPos, setCursorPos] = useState(null);
    const [previewNode, setPreview] = useState(null);
    const [insertPosition, setInsertPosition] = useState({ top: null, left: 0, width: 0 });

    const startDrag = useCallback((data) => {
        setDragData(data);

        document.body.style.userSelect = 'none';

        dropTargets.forEach((handler, id) => {
            const el = document.getElementById(id);
            if (!el) return;

            const accepts = handler.accept;
            const isAccepting = Array.isArray(accepts)
                ? accepts.includes(data.type)
                : accepts === data.type;

            if (isAccepting) {
                el.classList.add('droppable-highlight');
            }
        });
    }, [dropTargets]);
    const endDrag = useCallback(() => {
        setDragData(null);
        setPreview(null);
        setCursorPos(null);
        setInsertPosition({ top: null, left: 0, width: 0 })
        document.body.style.userSelect = '';
        dropTargets.forEach((_, id) => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('droppable-highlight');
            }
        });
    }, [dropTargets]);

    const registerDropTarget = useCallback((id, handler) => {
        setDropTargets(prev => {
            if (prev.get(id) === handler) return prev;
            const newMap = new Map(prev);
            newMap.set(id, handler);
            return newMap;
        });
    }, []);

    const unregisterDropTarget = useCallback((id) => {
        // console.log('Unregister dt');
        setDropTargets(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });
    }, []);

    const handleGlobalMouseUp = useCallback((e) => {
        if (!dragData) return;

        dropTargets.forEach((handler, id) => {
            const el = document.getElementById(id);
            if (el && el.contains(e.target)) {
                const children = Array.from(el.children);
                const targetIndex = children.findIndex(child => child.contains(e.target));

                const dropData = {
                    id,
                    index: targetIndex !== -1 ? targetIndex : undefined
                };
                handler.onDrop(dragData, dropData);
            }
        });

        setInsertPosition({ top: null, left: 0, width: 0 });

        endDrag();
    }, [dragData, dropTargets, endDrag]);

    useEffect(() => {
        const updateCursor = (e) => {
            setCursorPos({ x: e.clientX, y: e.clientY });

            for (let [id] of dropTargets) {
                const container = document.getElementById(id);
                if (!container) continue;

                const children = Array.from(container.children).filter(child => !child.classList.contains('insert-indicator'));
                for (let child of children) {
                    const rect = child.getBoundingClientRect();
                    const middleY = rect.top + rect.height / 2;

                    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                        const top = e.clientY < middleY ? rect.top : rect.bottom;
                        setInsertPosition({
                            top: `${top}px`,
                            left: `${rect.left}px`,
                            width: `${rect.width}px`,
                        });
                        return;
                    }
                }
            }

            // Якщо не знайдено — ховаємо
            setInsertPosition({ top: null, left: 0, width: 0 });
        };

        if (dragData) {
            window.addEventListener('mousemove', updateCursor);
        }

        return () => {
            window.removeEventListener('mousemove', updateCursor);
        };
    }, [dragData]);

    // Лише один глобальний слухач
    useEffect(() => {
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [handleGlobalMouseUp]);

    return (
        <DndContext.Provider value={{ dragData, startDrag, endDrag, registerDropTarget, unregisterDropTarget, setPreview, cursorPos }}>
            {children}
            {previewNode && cursorPos && (
                <div
                    style={{
                        position: 'fixed',
                        top: cursorPos.y + 5,
                        left: cursorPos.x + 5,
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                    dangerouslySetInnerHTML={{ __html: previewNode.outerHTML }}
                />
            )}
            <InsertIndicator {...insertPosition} />
        </DndContext.Provider>
    );
};

export const useDnd = () => useContext(DndContext);
