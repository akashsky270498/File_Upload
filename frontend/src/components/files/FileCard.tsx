import React from 'react';
import { Image as ImageIcon, Video, Music, FileText, Eye, Trash2, Calendar, HardDrive } from 'lucide-react';
import { MediaFile, FileType } from '../../types/file';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFileDetails } from '../../store/slices/filesSlice';
import { openConfirmModal } from '../../store/slices/uiSlice';

interface FileCardProps {
  file: MediaFile;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const uploaderId = file.uploader?._id || file.uploader?.id;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = Boolean(currentUserId && uploaderId && currentUserId === uploaderId);

  const renderTypeIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={18} className="type-icon type-image" />;
      case 'video':
        return <Video size={18} className="type-icon type-video" />;
      case 'audio':
        return <Music size={18} className="type-icon type-audio" />;
      case 'pdf':
        return <FileText size={18} className="type-icon type-pdf" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardClick = () => {
    dispatch(fetchFileDetails(file._id));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      openConfirmModal({
        title: 'Delete Media Asset',
        message: `Are you sure you want to delete "${file.title}"? This action cannot be undone.`,
        fileId: file._id,
      })
    );
  };

  return (
    <div className="file-card" onClick={handleCardClick}>
      {/* Thumbnail Preview Area */}
      <div className="file-card-preview">
        {file.fileType === 'image' ? (
          <img src={file.secureUrl} alt={file.title} loading="lazy" />
        ) : file.fileType === 'video' ? (
          <video src={file.secureUrl} preload="metadata" />
        ) : file.fileType === 'audio' ? (
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
            <FileText size={48} />
            <span>PDF DOCUMENT</span>
          </div>
        )}

        <div className="card-badge">
          {renderTypeIcon(file.fileType)}
          <span>{file.fileType.toUpperCase()}</span>
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

        <div className="file-meta">
          <div className="meta-item">
            <Eye size={14} />
            <span>{file.viewsCount} views</span>
          </div>
          <div className="meta-item">
            <HardDrive size={14} />
            <span>{formatFileSize(file.size)}</span>
          </div>
          <div className="meta-item">
            <Calendar size={14} />
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
