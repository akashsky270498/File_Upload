import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeConfirmModal, showToast } from '../../store/slices/uiSlice';
import { deleteFileThunk } from '../../store/slices/filesSlice';

export const ConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, title, message, fileId } = useAppSelector((state) => state.ui.confirmModal);

  if (!isOpen || !fileId) return null;

  const handleConfirmDelete = async () => {
    dispatch(closeConfirmModal());
    const result = await dispatch(deleteFileThunk(fileId));
    if (deleteFileThunk.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Media asset deleted successfully.', type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Failed to delete file.', type: 'error' }));
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => dispatch(closeConfirmModal())}>
      <div className="modal-content modal-sm confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="confirm-title-wrapper">
            <div className="confirm-icon-badge">
              <AlertTriangle size={20} className="text-warning" />
            </div>
            <h3>{title}</h3>
          </div>
          <button className="btn-icon" onClick={() => dispatch(closeConfirmModal())}>
            <X size={20} />
          </button>
        </div>

        <div className="confirm-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.75rem', gap: '0.85rem' }}>
          <button className="btn btn-secondary" onClick={() => dispatch(closeConfirmModal())}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirmDelete}>
            <Trash2 size={16} />
            <span>Delete File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
