import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle, Image as ImageIcon, Video, Music, FileText, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { uploadFileThunk, uploadBatchThunk, clearFileError } from '../../store/slices/filesSlice';
import { showToast } from '../../store/slices/uiSlice';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { isUploading, uploadProgress, error } = useAppSelector((state) => state.files);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelect = (filesList: FileList | File[]) => {
    const incoming = Array.from(filesList);
    const validFiles: File[] = [];

    for (const f of incoming) {
      if (f.size > 50 * 1024 * 1024) {
        dispatch(showToast({ message: `File "${f.name}" exceeds 50MB maximum limit.`, type: 'error' }));
      } else {
        validFiles.push(f);
      }
    }

    const combined = [...selectedFiles, ...validFiles];
    if (combined.length > 5) {
      dispatch(showToast({ message: 'Maximum 5 files can be uploaded at a time.', type: 'error' }));
      setSelectedFiles(combined.slice(0, 5));
    } else {
      setSelectedFiles(combined);
    }

    if (combined.length > 0 && !title) {
      setTitle(combined[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
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
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(tags));

    if (selectedFiles.length === 1) {
      formData.append('file', selectedFiles[0]);
      const result = await dispatch(uploadFileThunk({ formData }));
      if (uploadFileThunk.fulfilled.match(result)) {
        resetForm();
        dispatch(showToast({ message: 'Multimedia asset uploaded successfully!', type: 'success' }));
        onClose();
      } else {
        dispatch(showToast({ message: (result.payload as string) || 'Upload failed.', type: 'error' }));
      }
    } else {
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      const result = await dispatch(uploadBatchThunk({ formData }));
      if (uploadBatchThunk.fulfilled.match(result)) {
        resetForm();
        dispatch(showToast({ message: `Successfully published ${selectedFiles.length} media assets!`, type: 'success' }));
        onClose();
      } else {
        dispatch(showToast({ message: (result.payload as string) || 'Batch upload failed.', type: 'error' }));
      }
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setTitle('');
    setDescription('');
    setTags([]);
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3>Upload Multimedia Assets</h3>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>
              Max 5 Files
            </span>
          </div>
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
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*,video/*,audio/*,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesSelect(e.target.files);
              }
            }}
          />

          {/* Selected Files List or Dropzone */}
          {selectedFiles.length > 0 ? (
            <div className="selected-files-container" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
                  Selected Files ({selectedFiles.length}/5)
                </span>
                {selectedFiles.length < 5 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={14} /> Add More Files
                  </button>
                )}
              </div>

              <div className="selected-files-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="selected-media-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card, #1e293b)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Selected"
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '6px' }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {file.type.startsWith('video/') ? (
                            <Video size={18} />
                          ) : file.type.startsWith('audio/') ? (
                            <Music size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                          {file.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleRemoveFile(idx)}
                      style={{ color: '#ef4444', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFilesSelect(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-prompt">
                <div className="upload-icon-wrapper">
                  <UploadCloud size={36} />
                </div>
                <p className="drop-title">Drag & Drop up to 5 files here, or click to browse</p>

                <div className="media-type-chips">
                  <span className="media-chip"><ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} /> Image</span>
                  <span className="media-chip"><Video size={12} style={{ display: 'inline', marginRight: '4px' }} /> Video</span>
                  <span className="media-chip"><Music size={12} style={{ display: 'inline', marginRight: '4px' }} /> Audio</span>
                  <span className="media-chip"><FileText size={12} style={{ display: 'inline', marginRight: '4px' }} /> PDF</span>
                </div>

                <p className="drop-subtitle" style={{ marginTop: '6px', fontSize: '0.8rem', opacity: 0.8 }}>
                  Support batch uploading up to 5 files (Max 50MB per file)
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label>Title {selectedFiles.length > 1 ? '(Base Prefix)' : ''} *</label>
            <input
              type="text"
              placeholder="e.g. Sunset Drone Series 4K"
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
              rows={2}
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
              <span className="progress-text">{uploadProgress}% uploading assets to Cloudinary...</span>
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={selectedFiles.length === 0 || isUploading}>
              {isUploading
                ? 'Uploading...'
                : selectedFiles.length > 1
                ? `Publish ${selectedFiles.length} Media Files`
                : 'Publish Media'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

