import React, {createContext, useContext, useEffect, useState} from 'react';

// Create a context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
    const [openedTab, setOpenedTab] = useState('actions');
    const [activePopup, setActivePopup] = useState(null);
    const [popupMeta, setPopupMeta] = useState({});
    const [onClosePopupCb, setOnClosePopupCb] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1300);
    const togglePopup = (id, onClosePopupCb, popupMeta) => {
        if(!id) {
            setActivePopup(null);
            setPopupMeta(null);
            setOnClosePopupCb(null);
        }
        setActivePopup(id);
        setOnClosePopupCb(() => onClosePopupCb);
        setPopupMeta(popupMeta);
    }

    window.addEventListener('resize', (e) => {
        setIsMobile(window.innerWidth < 1300)
    })

    document.addEventListener('load', (e) => {
        setIsMobile(window.innerWidth < 1300)
    })

/*    useEffect(() => {
        if(!activePopup) {
            console.log('set onClosePopup CB to null', activePopup);
            setOnClosePopupCb(null);
        }
    }, [activePopup])*/

    return (
        <AppContext.Provider value={{ openedTab, setOpenedTab, activePopup, setActivePopup, popupMeta, setPopupMeta, onClosePopupCb, setOnClosePopupCb, isMobile, togglePopup }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};