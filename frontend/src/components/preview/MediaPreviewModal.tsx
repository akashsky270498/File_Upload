import React from 'react';
import { X, Eye, HardDrive, Calendar, Download, Tag, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSelectedFile } from '../../store/slices/filesSlice';
import { openConfirmModal } from '../../store/slices/uiSlice';

const getInitials = (fullName: string): string => {
  if (!fullName || !fullName.trim()) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const MediaPreviewModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const file = useAppSelector((state) => state.files.selectedFile);
  const currentUser = useAppSelector((state) => state.auth.user);

  if (!file) return null;

  const handleClose = () => {
    dispatch(setSelectedFile(null));
  };

  const mediaUrl = file.secureUrl || file.cloudinaryUrl || file.url || '';
  const fileTypeLower = String(file.fileType || '').toLowerCase();
  const isImage = fileTypeLower.includes('image') || fileTypeLower.includes('media') || fileTypeLower === 'post_media';
  const isVideo = fileTypeLower.includes('video');
  const isAudio = fileTypeLower.includes('audio');

  const uploader = (file as any).user || file.uploader;
  const uploaderId = uploader?._id || uploader?.id || file.userId || (file as any).user_id;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isCurrentUsersFile = Boolean(currentUserId && uploaderId && currentUserId === uploaderId);
  const isOwner = Boolean(isCurrentUsersFile || isAdmin);

  const uploaderName = uploader
    ? `${uploader.firstName || ''} ${uploader.lastName || ''}`.trim() || uploader.email || 'Platform User'
    : isCurrentUsersFile && currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Platform User';

  const uploaderAvatar = uploader?.profileImage || uploader?.profileImageUrl || uploader?.avatarUrl || (isCurrentUsersFile ? currentUser?.profileImage || currentUser?.avatarUrl : undefined);

  const viewsCount = (file as any).viewsCount ?? (file as any).views ?? 0;

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    const downloadName = file.originalName || `${file.title}.${isImage ? 'jpg' : isVideo ? 'mp4' : isAudio ? 'mp3' : 'pdf'}`;

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(mediaUrl, '_blank');
    }
  };

  const handleDelete = () => {
    const fileId = file.id || file._id;
    if (fileId) {
      dispatch(setSelectedFile(null));
      dispatch(
        openConfirmModal({
          title: 'Delete Media Asset',
          message: `Are you sure you want to delete "${file.title}"? This action cannot be undone.`,
          fileId,
        })
      );
    }
  };

  const getCleanFileTypeLabel = () => {
    if (isImage) return 'IMAGE';
    if (isVideo) return 'VIDEO';
    if (isAudio) return 'AUDIO';
    return 'DOCUMENT';
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content modal-lg media-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="media-preview-header-left">
            <span className="file-type-badge">{getCleanFileTypeLabel()}</span>
            <h3 className="media-preview-title">{file.title}</h3>
          </div>
          <button className="btn-icon" onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        {/* Media Player Container */}
        <div className="media-player-container">
          {isImage && (
            <img src={mediaUrl} alt={file.title} className="preview-image" />
          )}

          {isVideo && (
            <video src={mediaUrl} controls autoPlay className="preview-video" />
          )}

          {isAudio && (
            <div className="audio-player-wrapper">
              <div className="audio-disc">🎵</div>
              <audio src={mediaUrl} controls autoPlay className="custom-audio-controls" />
            </div>
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="pdf-viewer-wrapper" style={{ width: '100%', height: '520px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
              <object
                data={mediaUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ borderRadius: '12px', border: 'none', display: 'block' }}
              >
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(mediaUrl)}&embedded=true`}
                  title={file.title}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', borderRadius: '12px' }}
                />
              </object>
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="preview-details">
          {file.description && <p className="preview-description">{file.description}</p>}

          {file.tags && file.tags.length > 0 && (
            <div className="tag-list" style={{ marginTop: '0.85rem', marginBottom: '1.25rem' }}>
              {file.tags.map((tag, idx) => (
                <span key={idx} className="tag-chip">
                  <Tag size={12} /> #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Information Card */}
          <div className="preview-info-card">
            <div className="uploader-box">
              <div className="uploader-avatar">
                {uploaderAvatar ? (
                  <img src={uploaderAvatar} alt={uploaderName} />
                ) : (
                  <span>{getInitials(uploaderName)}</span>
                )}
              </div>
              <div className="uploader-meta">
                <span className="uploader-label">Uploaded by</span>
                <span className="uploader-name">{uploaderName}</span>
              </div>
            </div>

            <div className="stats-badges-row">
              <div className="stat-pill" title="Views">
                <Eye size={16} />
                <span>{viewsCount} views</span>
              </div>
              <div className="stat-pill" title="File Size">
                <HardDrive size={16} />
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="stat-pill" title="Upload Date">
                <Calendar size={16} />
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>

            <div className="action-buttons-group" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={handleDownload} className="btn btn-primary download-action-btn" style={{ flex: 1 }}>
                <Download size={18} />
                <span>Download File</span>
              </button>

              {isOwner && (
                <button onClick={handleDelete} className="btn btn-danger delete-action-btn" title="Delete Asset">
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
