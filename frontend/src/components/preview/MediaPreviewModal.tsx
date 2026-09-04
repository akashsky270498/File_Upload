import React from 'react';
import { X, Eye, HardDrive, Calendar, Download, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSelectedFile } from '../../store/slices/filesSlice';

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

  if (!file) return null;

  const handleClose = () => {
    dispatch(setSelectedFile(null));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const downloadName = file.originalName || `${file.title}.${file.fileType === 'pdf' ? 'pdf' : file.fileType === 'video' ? 'mp4' : file.fileType === 'audio' ? 'mp3' : 'jpg'}`;

    try {
      const response = await fetch(file.secureUrl);
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
      window.open(file.secureUrl, '_blank');
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content modal-lg media-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="media-preview-header-left">
            <span className="file-type-badge">{file.fileType.toUpperCase()}</span>
            <h3 className="media-preview-title">{file.title}</h3>
          </div>
          <button className="btn-icon" onClick={handleClose}>
            <X size={22} />
          </button>
        </div>

        {/* Media Player Container */}
        <div className="media-player-container">
          {file.fileType === 'image' && (
            <img src={file.secureUrl} alt={file.title} className="preview-image" />
          )}

          {file.fileType === 'video' && (
            <video src={file.secureUrl} controls autoPlay className="preview-video" />
          )}

          {file.fileType === 'audio' && (
            <div className="audio-player-wrapper">
              <div className="audio-disc">🎵</div>
              <audio src={file.secureUrl} controls autoPlay className="custom-audio-controls" />
            </div>
          )}

          {file.fileType === 'pdf' && (
            <iframe
              src={file.secureUrl}
              title={file.title}
              className="pdf-iframe"
            />
          )}
        </div>

        {/* Metadata Details with Generous Spacing */}
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

          {/* Spacious Information Card */}
          <div className="preview-info-card">
            <div className="uploader-box">
              <div className="uploader-avatar">
                {file.uploader?.avatarUrl ? (
                  <img src={file.uploader.avatarUrl} alt={file.uploader.name} />
                ) : (
                  <span>{getInitials(file.uploader?.name || 'User')}</span>
                )}
              </div>
              <div className="uploader-meta">
                <span className="uploader-label">Uploaded by</span>
                <span className="uploader-name">{file.uploader?.name || 'User'}</span>
              </div>
            </div>

            <div className="stats-badges-row">
              <div className="stat-pill" title="Views">
                <Eye size={16} />
                <span>{file.viewsCount} views</span>
              </div>
              <div className="stat-pill" title="File Size">
                <HardDrive size={16} />
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="stat-pill" title="Upload Date">
                <Calendar size={16} />
                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button onClick={handleDownload} className="btn btn-primary download-action-btn">
              <Download size={18} />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

