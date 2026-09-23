// ==========================================
// 👤 PUBLIC USER PROFILE MODAL
// ==========================================
// Ye component GraphQL `user(id)` query se kisi bhi user ki profile (Name, Avatar, Email, Mobile Number, Member Since) view karne ke liye render hota hai.

import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Calendar, Shield, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/user';
import { usersApi } from '../../services/usersApi';

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// User Full Name se Initials (e.g. "John Doe" -> "JD") extract karne ka helper
const getInitials = (fullName: string): string => {
  if (!fullName || !fullName.trim()) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

// Safe ISO Date Formatter ("Member Since" date display ke liye)
const formatMemberSince = (dateVal?: string | number): string => {
  if (!dateVal) return 'Recently';
  let d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    const num = Number(dateVal);
    if (!isNaN(num) && num > 0) {
      d = new Date(num > 1e11 ? num : num * 1000);
    }
  }
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal open hone par GraphQL `getUserById` API call run karte hain
  useEffect(() => {
    if (!isOpen || !userId) {
      setUser(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    usersApi
      .getUserById(userId)
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            setError(res.message || 'Failed to load user profile');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Error fetching user profile');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User Profile';
  const avatarUrl = user?.avatarUrl || user?.profileImageUrl || user?.profileImage;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '90%', boxSizing: 'border-box' }}
      >
        <div className="modal-header">
          <h3>User Profile</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading user details via GraphQL...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#ef4444' }}>
            <p>{error}</p>
          </div>
        ) : user ? (
          <div style={{ padding: '1rem 0 0.5rem 0' }}>
            {/* WhatsApp / Glass Header Avatar Container */}
            <div className="whatsapp-profile-avatar-container" style={{ marginBottom: '1.25rem' }}>
              <div className="whatsapp-avatar-wrapper">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="whatsapp-avatar-img" />
                ) : (
                  <div className="whatsapp-avatar-initials">
                    {getInitials(fullName)}
                  </div>
                )}
              </div>

              <h2 style={{ margin: '0.85rem 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {fullName}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: user.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                    color: user.role === 'ADMIN' ? '#818cf8' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Shield size={12} />
                  {user.role || 'USER'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={12} />
                  Active
                </span>
              </div>
            </div>

            {/* Profile Info Details Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
              }}
            >
              {/* Email Address */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                  <Mail size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Mobile Number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
                  <Phone size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile Number</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.mobileNumber || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Member Since Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}>
                  <Calendar size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member Since</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatMemberSince(user.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                Close Profile
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

