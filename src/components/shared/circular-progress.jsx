import React from 'react';

const CircularProgress = ({ progress, children }) => {
    return (
        <div className="circular-progress">
            {children}
            <div
                className="overlay"
                style={{
                    '--progress': progress,
                    '--angle': `${(1 - progress) * 360}`,
                }}
            ></div>
        </div>
    );
};

export default CircularProgress;