import React from 'react';
import { createPortal } from 'react-dom';

export const InsertIndicator = ({ top, left, width }) => {
    if (top === null) return null;

    return createPortal(
        <div
            className="insert-indicator"
            style={{ top, left, width }}
        />,
        document.body
    );
};