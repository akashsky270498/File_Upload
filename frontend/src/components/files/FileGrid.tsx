import React, { useState, useEffect, useRef } from 'react';
import { Layers, ChevronLeft, ChevronRight, UploadCloud, RefreshCw, Infinity as InfiniteIcon, ListOrdered, Loader } from 'lucide-react';
import { FileCard } from './FileCard';
import { useAppDispatch, useAppSelector } from '../../store';
import { setPage, fetchFiles } from '../../store/slices/filesSlice';

interface FileGridProps {
  onOpenUpload?: () => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ onOpenUpload }) => {
  const dispatch = useAppDispatch();
  const { files, meta, filters, isLoading, error } = useAppSelector((state) => state.files);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState<boolean>(true);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    if (!isInfiniteScroll || !meta || meta.page >= meta.totalPages || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          dispatch(setPage(filters.page + 1));
        }
      },
      { threshold: 0.5 }
    );

    const target = observerTargetRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isInfiniteScroll, meta, filters.page, isLoading, dispatch]);

  const fileList = Array.isArray(files) ? files : [];

  // Show skeleton loader only on initial application load when no files exist yet
  if (isLoading && fileList.length === 0 && filters.page === 1) {
    return (
      <div className="file-grid-skeleton">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="skeleton-card">
            <div className="skeleton-thumb" />
            <div className="skeleton-title" />
            <div className="skeleton-meta" />
          </div>
        ))}
      </div>
    );
  }

  if (error && fileList.length === 0 && filters.page === 1) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper error-glow">
          <RefreshCw size={36} className="text-error" />
        </div>
        <h3 className="empty-title">Failed to Load Media Files</h3>
        <p className="empty-subtitle">{error}</p>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => dispatch(fetchFiles(filters))}
          style={{ marginTop: '1rem' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (fileList.length === 0 && !isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper">
          <Layers size={42} className="empty-icon" />
        </div>
        <h3 className="empty-title">No Media Files Found</h3>
        <p className="empty-subtitle">
          Your media library is empty. Upload your images, videos, audio tracks, or documents to get started.
        </p>
        {onOpenUpload && (
          <button className="btn btn-primary" onClick={onOpenUpload} style={{ marginTop: '1.25rem' }}>
            <UploadCloud size={18} />
            <span>Upload Your First File</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="file-grid-wrapper" style={{ minHeight: '450px' }}>
      {/* Mode Toggle Bar */}
      <div className="feed-header-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
          Showing {fileList.length} {meta ? `of ${meta.total}` : ''} items
        </span>

        <div className="mode-toggle-group" style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setIsInfiniteScroll(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: isInfiniteScroll ? '#6366f1' : 'transparent',
              color: isInfiniteScroll ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <InfiniteIcon size={14} /> Infinite Scroll
          </button>
          <button
            onClick={() => setIsInfiniteScroll(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: !isInfiniteScroll ? '#6366f1' : 'transparent',
              color: !isInfiniteScroll ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <ListOrdered size={14} /> Pages
          </button>
        </div>
      </div>

      <div className="file-grid" style={{ opacity: isLoading && filters.page === 1 ? 0.65 : 1, transition: 'opacity 0.2s ease-in-out' }}>
        {fileList.map((file) => (
          <FileCard key={file._id || file.id} file={file} />
        ))}
      </div>

      {/* Infinite Scroll Observer Sentinel */}
      {isInfiniteScroll && meta && meta.page < meta.totalPages && (
        <div ref={observerTargetRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1' }}>
              <Loader size={20} className="animate-spin" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading more media assets...</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Scroll down to load more</span>
          )}
        </div>
      )}

      {/* Pagination Controls Mode */}
      {!isInfiniteScroll && meta && meta.totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '2rem' }}>
          <button
            className="pagination-btn"
            disabled={meta.page <= 1}
            onClick={() => dispatch(setPage(meta.page - 1))}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          <span className="pagination-info">
            Page {meta.page} of {meta.totalPages} ({meta.total} total items)
          </span>

          <button
            className="pagination-btn"
            disabled={meta.page >= meta.totalPages}
            onClick={() => dispatch(setPage(meta.page + 1))}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

