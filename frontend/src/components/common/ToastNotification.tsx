import React from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setActiveNotification, fetchFileDetails } from '../../store/slices/filesSlice';

export const ToastNotification: React.FC = () => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector((state) => state.files.activeNotification);

  if (!notification) return null;

  const handleOpenMedia = () => {
    dispatch(fetchFileDetails(notification.fileId));
    dispatch(setActiveNotification(null));
  };

  return (
    <div className="toast-notification">
      <div className="toast-icon">
        <Bell size={20} />
      </div>
      <div className="toast-content">
        <div className="toast-title">New Media Uploaded!</div>
        <div className="toast-body">
          <strong>{notification.uploaderName}</strong> uploaded &quot;{notification.title}&quot; ({notification.fileType.toUpperCase()})
        </div>
      </div>
      <button className="toast-action" onClick={handleOpenMedia} title="View Media">
        <ExternalLink size={16} />
      </button>
      <button className="toast-close" onClick={() => dispatch(setActiveNotification(null))} title="Close">
        <X size={16} />
      </button>
    </div>
  );
};
