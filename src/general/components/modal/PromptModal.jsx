import React, { useEffect, useRef, useState } from 'react';
import { CustomButton } from '../../../components/shared/buttons/custom-button.jsx';

const PromptModal = ({ title, message, defaultValue = '', onConfirm, onCancel, placeholder = '', confirmText = 'OK', cancelText = 'Cancel', onHide }) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef(null);

    useEffect(() => {
        // Auto-focus on input
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }

        // Handle escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            } else if (e.key === 'Enter') {
                handleConfirm();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleConfirm = () => {
        onConfirm && onConfirm(inputValue);
        onHide();
    };

    const handleCancel = () => {
        onCancel && onCancel();
        onHide();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content ingame-box">
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="modal-input"
                    />
                </div>
                <div className="modal-footer flex-container flex-row">
                    <CustomButton
                        onClick={handleConfirm}
                        className="primary-action"
                    >
                        {confirmText}
                    </CustomButton>
                    <CustomButton
                        onClick={handleCancel}
                        className="warning-action"
                    >
                        {cancelText}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;
