import React from 'react'

const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) => {
    if (!open) return null;

  return (
    <div className='modal-overlay'>
        <div className='modal'>
            <div className='modal-header'>
                <div>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>
            </div>
            <div className='modal-actions'>
                <button className='cancel-btn' type='button' onClick={onCancel}>Cancel</button>
                <button className='add-btn' type='button' onClick={onConfirm}>{confirmLabel}</button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmDialog
