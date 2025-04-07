import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const TippyWrapper = ({
                                 content,
                                 children,
                                 placement = 'right',
                                 onShow = () => {},
                                 onHide = () => {},
                                 lazy = false,
                             }) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef();
    const popoverRef = useRef();

    const placementsPriority = {
        top: ['top', 'bottom'],
        bottom: ['bottom', 'top'],
        left: ['left', 'right'],
        right: ['right', 'left'],
    };

    useEffect(() => {
        if (visible) onShow();
        else onHide();
    }, [visible]);

    const positionPopover = () => {
        if (!popoverRef.current || !ref.current) return;

        const targetRect = ref.current.getBoundingClientRect();
        const popover = popoverRef.current;
        const popoverRect = popover.getBoundingClientRect();

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

                const margin = 8;
                if (isVertical) {
                    if (left < margin) left = margin;
                    if (left + popoverRect.width > viewportWidth - margin)
                        left = viewportWidth - popoverRect.width - margin;
                }

                if (isHorizontal) {
                    if (top < margin) top = margin;
                    if (top + popoverRect.height > viewportHeight - margin)
                        top = viewportHeight - popoverRect.height - margin;
                }

                finalPlacement = tryPlacement;
                break;
            }
        }

        popover.style.position = 'absolute';
        popover.style.top = `${top + window.scrollY}px`;
        popover.style.left = `${left + window.scrollX}px`;
        popover.style.zIndex = 9999;
        popover.dataset.placement = finalPlacement;
    };

    useEffect(() => {
        if (!visible) return;
        requestAnimationFrame(positionPopover);
    }, [visible, placement]);

    if (!isValidElement(children)) {
        console.warn('TippyWrapper: children must be a single valid React element');
        return children;
    }

    const cloned = cloneElement(children, {
        ref,
        onMouseEnter: () => setVisible(true),
        onMouseLeave: () => setVisible(false),
    });

    const popoverElement = visible ? (
        <div
            ref={popoverRef}
            className="custom-popover"
        >
            {lazy ? content : content}
        </div>
    ) : null;

    return (
        <>
            {cloned}
            {createPortal(popoverElement, document.body)}
        </>
    );
};
