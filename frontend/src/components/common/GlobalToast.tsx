import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { hideToast } from '../../store/slices/uiSlice';

export const GlobalToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dispatch(hideToast());
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="toast-icon text-success" />;
      case 'error':
        return <AlertCircle size={20} className="toast-icon text-error" />;
      case 'info':
      default:
        return <Info size={20} className="toast-icon text-info" />;
    }
  };

  return (
    <div className={`global-toast toast-${toast.type}`}>
      {renderIcon()}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close-btn" onClick={() => dispatch(hideToast())}>
        <X size={16} />
      </button>
    </div>
  );
};
