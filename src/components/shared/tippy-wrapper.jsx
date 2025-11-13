import React, {
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import ReactDOM from "react-dom";
import { useTippyContext } from "../../context/tippy-context.jsx";

const NOOP = () => {};

const placementsPriority = {
    top: ['top', 'bottom'],
    bottom: ['bottom', 'top'],
    left: ['left', 'right'],
    right: ['right', 'left'],
};

const isPrimitive = value => value === null || (typeof value !== 'object' && typeof value !== 'function');

function areReactNodesEqual(prevNode, nextNode) {
    if (prevNode === nextNode) {
        return true;
    }

    if (Array.isArray(prevNode) || Array.isArray(nextNode)) {
        return areNodeArraysEqual(prevNode, nextNode);
    }

    if (isPrimitive(prevNode) || isPrimitive(nextNode)) {
        return Object.is(prevNode, nextNode);
    }

    if (!isValidElement(prevNode) || !isValidElement(nextNode)) {
        return false;
    }

    if (prevNode.type !== nextNode.type || prevNode.key !== nextNode.key) {
        return false;
    }

    const prevProps = prevNode.props || {};
    const nextProps = nextNode.props || {};

    const prevPropKeys = Object.keys(prevProps).filter(key => key !== 'children');
    const nextPropKeys = Object.keys(nextProps).filter(key => key !== 'children');

    if (prevPropKeys.length !== nextPropKeys.length) {
        return false;
    }

    for (const key of prevPropKeys) {
        if (!Object.prototype.hasOwnProperty.call(nextProps, key)) {
            return false;
        }

        if (!Object.is(prevProps[key], nextProps[key])) {
            return false;
        }
    }

    return areReactNodesEqual(prevProps.children, nextProps.children);
}

function areNodeArraysEqual(a, b) {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (!areReactNodesEqual(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

const TippyWrapperComponent = ({
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
    const visibleRef = useRef(false);
    const { portalContainer } = useTippyContext();
    const childIsValid = isValidElement(children);

    const positionPopover = useCallback(() => {
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
    }, [placement]);

    useEffect(() => {
        visibleRef.current = visible;
        if (visible) {
            onShow();
        } else {
            onHide();
        }
    }, [visible, onShow, onHide]);

    // Use global portal container instead of creating new ones
    useEffect(() => {
        // Додаємо ResizeObserver для автоматичного оновлення позиції
        let resizeObserver = null;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                if (visibleRef.current && popoverRef.current) {
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
    }, [positionPopover]);

    useLayoutEffect(() => {
        if (!visible) return;
        let raf = requestAnimationFrame(() => {
            positionPopover();
            if (popoverRef.current) {
                popoverRef.current.style.visibility = 'visible';
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [visible, positionPopover]);

    useEffect(() => {
        if (!visible && popoverRef.current) {
            popoverRef.current.style.visibility = 'hidden';
        }
    }, [visible]);

    // useEffect для відстеження змін popoverRef.current

    const handleMouseEnter = useCallback(() => {
        if (!ref.current) return;

        // Перевіряємо чи елемент все ще видимий
        const rect = ref.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Спочатку монтуємо прихований елемент, наступним кадром позиціюємо і показуємо
        setVisible(prev => (prev ? prev : true));
    }, []);

    const handleMouseLeave = useCallback(() => {
        setVisible(false);
    }, []);

    const handleMouseMove = useCallback(() => {
        if (visible && ref.current && popoverRef.current) {
            // Оновлюємо позицію при руху миші (якщо потрібно)
            const rect = ref.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                positionPopover();
            }
        }
    }, [positionPopover, visible]);

    const cloned = useMemo(() => {
        if (!childIsValid) {
            return children;
        }

        return cloneElement(children, {
            ref,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onMouseMove: handleMouseMove,
        });
    }, [childIsValid, children, handleMouseEnter, handleMouseLeave, handleMouseMove]);

    const popoverElement = useMemo(() => (visible && childIsValid ? (
        <div
            ref={popoverRef}
            className="custom-popover"
            style={{ visibility: 'hidden', top: '-9999px', left: '-9999px' }}
        >
            {lazy ? content : content}
        </div>
    ) : null), [childIsValid, content, lazy, visible]);

    if (!childIsValid) {
        console.warn('TippyWrapper: children must be a single valid React element');
        return children;
    }

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

export const TippyWrapper = React.memo(
    TippyWrapperComponent,
    (prevProps, nextProps) => {
        if (prevProps.lazy !== nextProps.lazy) {
            return false;
        }

        if (prevProps.placement !== nextProps.placement) {
            return false;
        }

        if (prevProps.onShow !== nextProps.onShow || prevProps.onHide !== nextProps.onHide) {
            return false;
        }

        if (!areReactNodesEqual(prevProps.content, nextProps.content)) {
            return false;
        }

        if (!areReactNodesEqual(prevProps.children, nextProps.children)) {
            return false;
        }

        return true;
    },
);
