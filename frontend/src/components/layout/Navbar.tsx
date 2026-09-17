import React, { useState, useRef, useEffect } from 'react';
import { Layers, Upload, LogOut, FileCode, Settings, Bell, Trash2, ExternalLink, Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { markNotificationsRead, clearNotificationsHistory, fetchFileDetails } from '../../store/slices/filesSlice';
import { showToast, toggleTheme } from '../../store/slices/uiSlice';
import { ProfileModal } from '../users/ProfileModal';
import { SOCKET_URL } from '../../config/env.config';


interface NavbarProps {
  onOpenUpload: () => void;
}

const getInitials = (fullName: string): string => {
  if (!fullName || !fullName.trim()) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { notificationsHistory, unreadCount } = useAppSelector((state) => state.files);
  const currentTheme = useAppSelector((state) => state.ui.theme);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    if (!isNotificationsOpen && unreadCount > 0) {
      dispatch(markNotificationsRead());
    }
  };

  const handleNotificationClick = (fileId: string) => {
    dispatch(fetchFileDetails(fileId));
    setIsNotificationsOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(showToast({ message: 'Successfully logged out.', type: 'info' }));
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="brand-logo">
            <div className="logo-icon">
              <Layers size={24} />
            </div>
            <span className="brand-title">OmniMedia</span>
            <span className="brand-badge">PRO</span>
          </div>

          <div className="header-actions">
            {/* Dark/Light Mode Switcher */}
            <button
              className="btn-icon theme-toggle-btn"
              onClick={() => dispatch(toggleTheme())}
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {currentTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <a
              href={`${SOCKET_URL}/api-docs`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <FileCode size={16} />
              <span>API Docs</span>
            </a>

            {isAuthenticated ? (
              <>
                <button className="btn btn-primary" onClick={onOpenUpload}>
                  <Upload size={18} />
                  <span>Upload Media</span>
                </button>

                {/* Notification Bell Dropdown with Outside-Click Listener */}
                <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
                  <button
                    className="btn-icon bell-btn"
                    onClick={handleToggleNotifications}
                    title="Live Activity Stream"
                    style={{ position: 'relative' }}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="notification-dropdown">
                      <div className="dropdown-header">
                        <h4>Live Upload Activity</h4>
                        {notificationsHistory.length > 0 && (
                          <button
                            className="clear-notifications-btn"
                            onClick={() => dispatch(clearNotificationsHistory())}
                            title="Clear History"
                          >
                            <Trash2 size={14} /> Clear
                          </button>
                        )}
                      </div>

                      <div className="dropdown-body">
                        {notificationsHistory.length === 0 ? (
                          <div className="no-notifications">
                            <p>No recent upload activity</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              When any user uploads a file, live updates will appear here instantly.
                            </span>
                          </div>
                        ) : (
                          notificationsHistory.map((item, idx) => (
                            <div
                              key={idx}
                              className="notification-item"
                              onClick={() => handleNotificationClick(item.fileId)}
                            >
                              <div className="item-title">{item.title}</div>
                              <div className="item-details">
                                Uploaded by <strong>{item.uploaderName}</strong> ({item.fileType.toUpperCase()})
                              </div>
                              <div className="item-time">
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <ExternalLink size={12} style={{ marginLeft: '6px' }} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Badge */}
                <div
                  className="user-profile-menu"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsProfileOpen(true)}
                  title="Edit Profile"
                >
                  <div className="user-avatar">
                    {user?.avatarUrl || user?.profileImage || user?.profileImageUrl ? (
                      <img src={user.avatarUrl || user.profileImage || user.profileImageUrl} alt={user ? `${user.firstName} ${user.lastName}` : ''} />
                    ) : (
                      <span className="avatar-initials">
                        {getInitials(user ? `${user.firstName} ${user.lastName}` : '')}
                      </span>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      {user ? `${user.firstName} ${user.lastName}` : 'Authenticated User'}
                    </span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                  <Settings size={16} style={{ color: 'var(--text-muted)' }} />
                </div>

                {/* Separate Logout Button */}
                <button
                  className="btn btn-secondary btn-sm logout-header-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
