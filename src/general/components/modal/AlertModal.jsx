import React, { useEffect, useRef } from 'react';
import { CustomButton } from '../../../components/shared/buttons/custom-button.jsx';

const AlertModal = ({ title, message, onClose, onHide }) => {
    const closeButtonRef = useRef(null);

    useEffect(() => {
        // Auto-focus on close button
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }

        // Handle escape key and enter key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClose = () => {
        onClose && onClose();
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
                        ref={closeButtonRef}
                        onClick={handleClose}
                        className="primary-action"
                    >
                        OK
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
