import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const TippyContext = createContext();

export const TippyProvider = ({ children }) => {
    const portalContainerRef = useRef(null);
    // Створюємо контейнер синхронно один раз, щоб уникнути зміни null -> element у споживачів
    const [portalContainer] = useState(() => {
        console.error('Container created');
        const container = document.createElement('div');
        container.className = 'tippy-portal-container';
        document.body.appendChild(container);
        portalContainerRef.current = container;
        return container;
    });

    useEffect(() => {
        return () => {
            if (portalContainerRef.current) {
                document.body.removeChild(portalContainerRef.current);
                portalContainerRef.current = null;
            }
        };
    }, []);

    const value = useMemo(() => ({ portalContainer }), [portalContainer]);

    return (
        <TippyContext.Provider value={value}>
            {children}
        </TippyContext.Provider>
    );
};

export const useTippyContext = () => {
    const context = useContext(TippyContext);
    if (!context) {
        throw new Error('useTippyContext must be used within TippyProvider');
    }
    return context;
}; 