import React, { useEffect, useRef } from 'react';
import { CustomButton } from '../../../components/shared/buttons/custom-button.jsx';

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText, cancelText, onHide }) => {
    const confirmButtonRef = useRef(null);

    useEffect(() => {
        // Auto-focus on confirm button
        if (confirmButtonRef.current) {
            confirmButtonRef.current.focus();
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
        onConfirm && onConfirm();
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
                </div>
                <div className="modal-footer flex-container flex-row">
                    <CustomButton
                        ref={confirmButtonRef}
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

export default ConfirmModal;
