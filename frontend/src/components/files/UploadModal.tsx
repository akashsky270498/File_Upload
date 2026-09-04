import React, { useState, useRef } from 'react';
import { UploadCloud, X, Tag, CheckCircle, AlertCircle, Image as ImageIcon, Video, Music, FileText, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { uploadFileThunk, clearFileError } from '../../store/slices/filesSlice';
import { showToast } from '../../store/slices/uiSlice';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { isUploading, uploadProgress, error } = useAppSelector((state) => state.files);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      dispatch(showToast({ message: 'File size exceeds 50MB maximum limit.', type: 'error' }));
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(tags));

    const result = await dispatch(uploadFileThunk({ formData }));
    if (uploadFileThunk.fulfilled.match(result)) {
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setTags([]);
      dispatch(showToast({ message: 'Multimedia asset uploaded successfully!', type: 'success' }));
      onClose();
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Upload failed.', type: 'error' }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Multimedia File</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => dispatch(clearFileError())} className="alert-close">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Interactive Dropzone */}
          <div
            className={`dropzone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="selected-media-card">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected"
                    className="selected-preview-thumb"
                  />
                ) : (
                  <div className="selected-media-icon">
                    {selectedFile.type.startsWith('video/') ? (
                      <Video size={30} />
                    ) : selectedFile.type.startsWith('audio/') ? (
                      <Music size={30} />
                    ) : (
                      <FileText size={30} />
                    )}
                  </div>
                )}

                <div className="selected-file-details">
                  <span className="selected-filename">{selectedFile.name}</span>
                  <div className="selected-file-meta">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span className="change-file-btn">Click to Replace File</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dropzone-prompt">
                <div className="upload-icon-wrapper">
                  <UploadCloud size={32} />
                </div>
                <p className="drop-title">Drag & Drop media here, or click to browse</p>

                <div className="media-type-chips">
                  <span className="media-chip"><ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} /> Image</span>
                  <span className="media-chip"><Video size={12} style={{ display: 'inline', marginRight: '4px' }} /> Video</span>
                  <span className="media-chip"><Music size={12} style={{ display: 'inline', marginRight: '4px' }} /> Audio</span>
                  <span className="media-chip"><FileText size={12} style={{ display: 'inline', marginRight: '4px' }} /> PDF</span>
                </div>

                <p className="drop-subtitle" style={{ marginTop: '4px' }}>
                  Maximum file limit: 50MB
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder="e.g. Sunset Drone Video 4K"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Short description of the media asset..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-row">
              <input
                type="text"
                placeholder="Type tag and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
                <Plus size={16} />
                <span>Add Tag</span>
              </button>
            </div>

            {tags.length > 0 && (
              <div className="tag-pills-row">
                {tags.map((t) => (
                  <span key={t} className="tag-pill">
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
              <span className="progress-text">{uploadProgress}% uploading to cloud...</span>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '1.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!selectedFile || isUploading}>
              {isUploading ? 'Uploading...' : 'Publish Media'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

