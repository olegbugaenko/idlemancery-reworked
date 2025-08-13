import React, { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useTippyContext } from "../../context/tippy-context.jsx";

const NOOP = () => {};

export const TippyWrapper = ({
                                 content,
                                 children,
                                 placement = 'right',
                                  onShow = NOOP,
                                  onHide = NOOP,
                                 lazy = false,
                             }) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef();
    const popoverRef = useRef();
    const { portalContainer } = useTippyContext();

    const placementsPriority = {
        top: ['top', 'bottom'],
        bottom: ['bottom', 'top'],
        left: ['left', 'right'],
        right: ['right', 'left'],
    };

    useEffect(() => {
        if (visible) {
            onShow();
        } else {
            onHide();
        }
        // Depend only on visibility to avoid retriggers from new function identities
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // Use global portal container instead of creating new ones
    useEffect(() => {
        // Додаємо ResizeObserver для автоматичного оновлення позиції
        let resizeObserver = null;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                if (visible && popoverRef.current) {
                    // Невелика затримка для стабілізації
                    setTimeout(() => positionPopover(), 50);
                }
            });
            resizeObserver.observe(document.body);
        }
        
        // Cleanup on unmount
        return () => {
            setVisible(false); // Hide popover before unmounting
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    const positionPopover = () => {
        if (!popoverRef.current || !ref.current) return;

        const targetRect = ref.current.getBoundingClientRect();
        const popover = popoverRef.current;
        const popoverRect = popover.getBoundingClientRect();

        // Перевіряємо чи елемент-ціль все ще видимий
        if (targetRect.width === 0 || targetRect.height === 0) {
            setVisible(false);
            return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0, left = 0;
        let finalPlacement = placement;

        for (const tryPlacement of placementsPriority[placement] || [placement]) {
            let potentialTop = 0;
            let potentialLeft = 0;

            if (tryPlacement === 'top') {
                potentialTop = targetRect.top - popoverRect.height - 8;
                potentialLeft = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            } else if (tryPlacement === 'bottom') {
                potentialTop = targetRect.bottom + 8;
                potentialLeft = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            } else if (tryPlacement === 'left') {
                potentialTop = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
                potentialLeft = targetRect.left - popoverRect.width - 8;
            } else if (tryPlacement === 'right') {
                potentialTop = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
                potentialLeft = targetRect.right + 8;
            }

            const isHorizontal = ['left', 'right'].includes(tryPlacement);
            const isVertical = ['top', 'bottom'].includes(tryPlacement);

            const fitsVertical = potentialTop >= 0 && (potentialTop + popoverRect.height) <= viewportHeight;
            const fitsHorizontal = potentialLeft >= 0 && (potentialLeft + popoverRect.width) <= viewportWidth;

            const fits = isVertical ? fitsVertical : fitsHorizontal;

            if (fits) {
                top = potentialTop;
                left = potentialLeft;
                finalPlacement = tryPlacement;
                break;
            }
        }

        // Клапаємо координати всередині вʼюпорту замість приховування
        const maxTop = Math.max(0, viewportHeight - popoverRect.height - 1);
        const maxLeft = Math.max(0, viewportWidth - popoverRect.width - 1);
        const clampedTop = Math.max(0, Math.min(top, maxTop));
        const clampedLeft = Math.max(0, Math.min(left, maxLeft));

        // Застосовуємо позицію
        popover.style.top = `${clampedTop}px`;
        popover.style.left = `${clampedLeft}px`;
        popover.setAttribute('data-placement', finalPlacement);
    };

    useLayoutEffect(() => {
        if (!visible) return;
        let raf = requestAnimationFrame(() => {
            positionPopover();
            if (popoverRef.current) {
                popoverRef.current.style.visibility = 'visible';
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [visible, placement]);

    useEffect(() => {
        if (!visible && popoverRef.current) {
            popoverRef.current.style.visibility = 'hidden';
        }
    }, [visible]);

    // useEffect для відстеження змін popoverRef.current

    const handleMouseEnter = () => {
        if (!ref.current) return;
        
        // Перевіряємо чи елемент все ще видимий
        const rect = ref.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Спочатку монтуємо прихований елемент, наступним кадром позиціюємо і показуємо
        setVisible(prev => (prev ? prev : true));
    };

    const handleMouseLeave = () => {
        setVisible(false);
    };

    const handleMouseMove = () => {
        if (visible && ref.current && popoverRef.current) {
            // Оновлюємо позицію при руху миші (якщо потрібно)
            const rect = ref.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                positionPopover();
            }
        }
    };

    if (!isValidElement(children)) {
        console.warn('TippyWrapper: children must be a single valid React element');
        return children;
    }

    const cloned = cloneElement(children, {
        ref,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseMove: handleMouseMove,
    });

    const popoverElement = visible ? (
        <div
            ref={popoverRef}
            className="custom-popover"
            style={{ visibility: 'hidden', top: '-9999px', left: '-9999px' }}
        >
            {lazy ? content : content}
        </div>
    ) : null;

    // Додаємо логи перед return
    // console.log('RENDER - Portal container:', portalContainer);
    // console.log('RENDER - Popover element:', popoverElement);
    // console.log('RENDER - Visible:', visible);

    return (
        <>
            {cloned}
            {visible && portalContainer && popoverElement
                ? ReactDOM.createPortal(popoverElement, portalContainer)
                : null}
        </>
    );
};
