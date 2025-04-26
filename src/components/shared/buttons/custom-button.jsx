import React, { useEffect, useRef } from "react";
import { TippyWrapper } from "../tippy-wrapper.jsx";

export const CustomButton = ({ children, iconId, onClick, ...props }) => {
    const iconRef = useRef(null);

    const handleClick = (e) => {
        if (iconRef.current) {
            void iconRef.current.offsetWidth;
            iconRef.current.classList.add('glow-anim');
            setTimeout(() => {
                if (iconRef.current) {
                    iconRef.current.classList.remove('glow-anim');
                }
            }, 1000);
        }

        // Викликаємо оригінальний onClick, якщо він переданий
        if (typeof onClick === 'function') {
            onClick(e);
        }
    };

    if (!iconId) {
        return (
            <button {...props} onClick={handleClick}>
                {children}
            </button>
        );
    }

    const btnIcon = (
        <div className="icon-shadow-wrapper">
            <div
                {...props}
                onClick={handleClick}
                className={`icon-content interface-icon ${props.className ?? ''} ${props.disabled ? 'disabled' : ''}`}
                ref={iconRef}
            >
                <img src={`icons/interface/${iconId}.png`} />
            </div>
        </div>
    );

    if (!children) return btnIcon;

    return (
        <TippyWrapper content={<div className={'hint-popup'}>{children}</div>}>
            {btnIcon}
        </TippyWrapper>
    );
};
