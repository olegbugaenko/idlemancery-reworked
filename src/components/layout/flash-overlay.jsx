import React from "react";
import ReactDOM from "react-dom";

export const FlashOverlay = ({ position, className }) => {
    return ReactDOM.createPortal(
        <div
            className={`flash-overlay ${className}`}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width: position.width,
                height: position.height,
                // ...other styles
            }}
        ></div>,
        document.body
    );
};