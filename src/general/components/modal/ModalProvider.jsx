import React, { createContext, useContext, useState } from 'react';
import ModalContainer from './ModalContainer.jsx';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState([]);

    const showModal = (modalData) => {
        const id = Date.now() + Math.random();
        setModals(prev => [...prev, { ...modalData, id }]);
        return id;
    };

    const hideModal = (id) => {
        setModals(prev => prev.filter(modal => modal.id !== id));
    };

    const hideAll = () => {
        setModals([]);
    };

    const showConfirm = ({ title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) => {
        return showModal({
            type: 'confirm',
            title,
            message,
            onConfirm,
            onCancel,
            confirmText,
            cancelText
        });
    };

    const showAlert = ({ title, message, onClose }) => {
        return showModal({
            type: 'alert',
            title,
            message,
            onClose
        });
    };

    const showPrompt = ({ title, message, defaultValue = '', onConfirm, onCancel, placeholder = '', confirmText = 'OK', cancelText = 'Cancel' }) => {
        return showModal({
            type: 'prompt',
            title,
            message,
            defaultValue,
            onConfirm,
            onCancel,
            placeholder,
            confirmText,
            cancelText
        });
    };

    const value = {
        modals,
        showModal,
        hideModal,
        hideAll,
        showConfirm,
        showAlert,
        showPrompt,
        // Convenience methods
        confirm: showConfirm,
        alert: showAlert,
        prompt: showPrompt
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
            <ModalContainer modals={modals} onHide={hideModal} />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        console.error('useModal must be used within a ModalProvider');
        // Return fallback functions to prevent crashes
        return {
            showConfirm: () => console.warn('ModalProvider not available'),
            showAlert: () => console.warn('ModalProvider not available'),
            showPrompt: () => console.warn('ModalProvider not available'),
            confirm: () => console.warn('ModalProvider not available'),
            alert: () => console.warn('ModalProvider not available'),
            prompt: () => console.warn('ModalProvider not available')
        };
    }
    return context;
};
