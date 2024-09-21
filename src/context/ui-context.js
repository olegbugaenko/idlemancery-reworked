import React, { createContext, useContext, useState } from 'react';

// Create a context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
    const [openedTab, setOpenedTab] = useState(null);
    const [activePopup, setActivePopup] = useState(null);
    const [popupMeta, setPopupMeta] = useState({});

    return (
        <AppContext.Provider value={{ openedTab, setOpenedTab, activePopup, setActivePopup, popupMeta, setPopupMeta }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};