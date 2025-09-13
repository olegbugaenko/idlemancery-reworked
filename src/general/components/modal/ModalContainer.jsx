import React from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from './ConfirmModal.jsx';
import AlertModal from './AlertModal.jsx';
import PromptModal from './PromptModal.jsx';

const ModalContainer = ({ modals, onHide }) => {
    if (modals.length === 0) return null;

    return createPortal(
        <div className="modal-overlay">
            {modals.map(modal => {
                switch (modal.type) {
                    case 'confirm':
                        return <ConfirmModal key={modal.id} {...modal} onHide={() => onHide(modal.id)} />;
                    case 'alert':
                        return <AlertModal key={modal.id} {...modal} onHide={() => onHide(modal.id)} />;
                    case 'prompt':
                        return <PromptModal key={modal.id} {...modal} onHide={() => onHide(modal.id)} />;
                    default:
                        return null;
                }
            })}
        </div>,
        document.body
    );
};

export default ModalContainer;
