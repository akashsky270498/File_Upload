import React, { useState, useRef } from 'react';
import { X, Save, Mail, Phone, Camera, Check, User as UserIcon, Lock, Key } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { usersApi } from '../../services/usersApi';
import { authApi } from '../../services/authApi';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { showToast } from '../../store/slices/uiSlice';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Exactly 2 default preset avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
];

const getInitials = (fullName: string): string => {
  if (!fullName || !fullName.trim()) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form state
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUser?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatarFile(null);
    setPreviewUrl(url);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      await usersApi.updateProfile({
        firstName,
        lastName,
        mobileNumber,
        profileImage: avatarFile ? undefined : previewUrl,
        avatarFile: avatarFile || undefined,
      });

      dispatch(fetchCurrentUser());
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
      onClose();
    } catch {
      dispatch(showToast({ message: 'Failed to update profile.', type: 'error' }));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      dispatch(showToast({ message: 'New password must be at least 6 characters long.', type: 'error' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      dispatch(showToast({ message: 'New password and confirmation do not match.', type: 'error' }));
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        dispatch(showToast({ message: 'Password changed successfully!', type: 'success' }));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        dispatch(showToast({ message: res.message || 'Failed to change password.', type: 'error' }));
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to change password.';
      dispatch(showToast({ message: errorMsg, type: 'error' }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', width: '90%', boxSizing: 'border-box' }}>
        <div className="modal-header">
          <h3>Account Settings</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="profile-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            className={`pill-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <UserIcon size={15} />
            <span>Profile</span>
          </button>
          <button
            type="button"
            className={`pill-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Lock size={15} />
            <span>Password</span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="profile-form">
            {/* WhatsApp-style Circular Avatar Container */}
            <div className="whatsapp-profile-avatar-container">
              <div className="whatsapp-avatar-wrapper">
                {previewUrl ? (
                  <img src={previewUrl} alt={`${firstName} ${lastName}`} className="whatsapp-avatar-img" />
                ) : (
                  <div className="whatsapp-avatar-initials">
                    {getInitials(`${firstName} ${lastName}`)}
                  </div>
                )}
                <button
                  type="button"
                  className="whatsapp-avatar-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change Profile Picture"
                >
                  <Camera size={18} />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '0.75rem' }}>
                <span className="user-email">
                  <Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {currentUser?.email}
                </span>
                {currentUser?.mobileNumber && (
                  <span className="user-mobile" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {currentUser?.mobileNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Preset Avatars Row - Only 2 Avatars */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ textAlign: 'center', display: 'block' }}>Choose default preset avatar (2 options):</label>
              <div className="preset-avatars-row">
                {PRESET_AVATARS.map((url, idx) => (
                  <div
                    key={idx}
                    className={`preset-avatar-chip ${previewUrl === url ? 'selected' : ''}`}
                    onClick={() => handleSelectPreset(url)}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} />
                    {previewUrl === url && (
                      <div className="chip-check">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* First Name & Last Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mobile Number Field */}
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSavingProfile}>
                <Save size={16} />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label>Current Password *</label>
              <div className="input-wrapper">
                <Key size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                <Key size={16} />
                <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


