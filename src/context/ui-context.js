import React, {createContext, useContext, useEffect, useState} from 'react';

// Create a context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
    const [openedTab, setOpenedTab] = useState('actions');
    const [activePopup, setActivePopup] = useState(null);
    const [popupMeta, setPopupMeta] = useState({});
    const [onClosePopupCb, setOnClosePopupCb] = useState(null);

    useEffect(() => {
        console.log('stOnClose')
        // setOnClosePopupCb(null);
    }, [activePopup])

    return (
        <AppContext.Provider value={{ openedTab, setOpenedTab, activePopup, setActivePopup, popupMeta, setPopupMeta, onClosePopupCb, setOnClosePopupCb }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};