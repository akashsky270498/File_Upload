// ==========================================
// 🃏 FILE CARD COMPONENT
// ==========================================
// Ye component dashboard feed me uploaded media/documents rendering, instant thumbnail previews (Images, Videos, Audio, PDFs),
// uploader details, views count, aur delete action button show karta hai.

import React, { useState } from 'react';
import { Image as ImageIcon, Video, Music, FileText, Eye, Trash2, Calendar, HardDrive, User as UserIcon } from 'lucide-react';
import { MediaFile } from '../../types/file';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFileDetails, setSelectedFile } from '../../store/slices/filesSlice';
import { openConfirmModal } from '../../store/slices/uiSlice';
import { PublicProfileModal } from '../users/PublicProfileModal';

interface FileCardProps {
  file: MediaFile;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Uploader ID aur permissions check (Owner ya Admin hai tabhi delete button dikhayenge)
  const uploaderObj = (file as any).user || file.uploader;
  const uploaderId = uploaderObj?._id || uploaderObj?.id || file.userId || (file as any).user_id;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isOwner = Boolean((currentUserId && uploaderId && currentUserId === uploaderId) || isAdmin);

  const uploaderName = uploaderObj
    ? `${uploaderObj.firstName || ''} ${uploaderObj.lastName || ''}`.trim() || uploaderObj.email
    : null;

  const fileTypeLower = String(file.fileType || '').toLowerCase();
  const isImage = fileTypeLower.includes('image') || fileTypeLower.includes('media') || fileTypeLower === 'post_media';
  const isVideo = fileTypeLower.includes('video');
  const isAudio = fileTypeLower.includes('audio');

  // File type icon selecter
  const renderTypeIcon = () => {
    if (isImage) return <ImageIcon size={18} className="type-icon type-image" />;
    if (isVideo) return <Video size={18} className="type-icon type-video" />;
    if (isAudio) return <Music size={18} className="type-icon type-audio" />;
    return <FileText size={18} className="type-icon type-pdf" />;
  };

  // Human-readable file size formatter (KB / MB / GB)
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Safe Date formatter
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fileId = file.id || file._id || '';
  const fileMediaUrl = file.secureUrl || file.cloudinaryUrl || file.url || '';
  const viewsCount = (file as any).viewsCount ?? (file as any).views ?? 0;

  const getCleanFileTypeLabel = () => {
    if (isImage) return 'IMAGE';
    if (isVideo) return 'VIDEO';
    if (isAudio) return 'AUDIO';
    return 'DOCUMENT';
  };

  // Card click hone par File Modal Open karna aur View Counter increment query trigger karna
  const handleCardClick = () => {
    dispatch(setSelectedFile(file));
    if (fileId) dispatch(fetchFileDetails(fileId));
  };

  // Delete button click handler
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileId) {
      dispatch(
        openConfirmModal({
          title: 'Delete Media Asset',
          message: `Are you sure you want to delete "${file.title}"? This action cannot be undone.`,
          fileId,
        })
      );
    }
  };

  return (
    <div className="file-card" onClick={handleCardClick}>
      {/* Thumbnail Preview Area */}
      <div className="file-card-preview">
        {isImage ? (
          <img src={fileMediaUrl} alt={file.title} loading="lazy" />
        ) : isVideo ? (
          <video src={fileMediaUrl} preload="metadata" />
        ) : isAudio ? (
          <div className="preview-audio-graphic">
            <Music size={42} />
            <div className="sound-wave">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <div className="preview-pdf-graphic">
            {fileMediaUrl.toLowerCase().includes('.pdf') ? (
              <img
                src={fileMediaUrl.replace(/\.pdf$/i, '.jpg').replace('/upload/', '/upload/pg_1,f_auto,q_auto/')}
                alt={file.title}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <div className="preview-pdf-fallback">
              <FileText size={44} />
              <span>DOCUMENT</span>
            </div>
          </div>
        )}

        <div className="card-badge">
          {renderTypeIcon()}
          <span>{getCleanFileTypeLabel()}</span>
        </div>

        {isOwner && (
          <button className="delete-btn" onClick={handleDeleteClick} title="Delete File">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Card Info Details */}
      <div className="file-card-body">
        <h3 className="file-title">{file.title}</h3>
        {file.description && <p className="file-description">{file.description}</p>}

        {file.tags && file.tags.length > 0 && (
          <div className="tag-list">
            {file.tags.map((tag, idx) => (
              <span key={idx} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="file-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {uploaderName && (
            <div
              className="uploader-name-tag"
              onClick={(e) => {
                e.stopPropagation();
                if (uploaderId) setSelectedUserId(uploaderId);
              }}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
              title="Click to view user profile"
            >
              <UserIcon size={12} />
              <span>Uploaded by {uploaderName}</span>
            </div>
          )}

          <div className="meta-stats-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.775rem', color: '#94a3b8' }}>
            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Eye size={13} />
              <span>{viewsCount} views</span>
            </div>
            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <HardDrive size={13} />
              <span>{formatFileSize(file.size)}</span>
            </div>
            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} />
              <span>{formatDate(file.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* User Public Profile Modal trigger */}
        <PublicProfileModal
          userId={selectedUserId}
          isOpen={Boolean(selectedUserId)}
          onClose={() => setSelectedUserId(null)}
        />
      </div>
    </div>
  );
};

