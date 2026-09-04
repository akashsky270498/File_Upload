import React from 'react';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { FileCard } from './FileCard';
import { useAppDispatch, useAppSelector } from '../../store';
import { setPage } from '../../store/slices/filesSlice';

export const FileGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { files, meta, isLoading, error } = useAppSelector((state) => state.files);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon text-error">⚠️</div>
        <h3>Failed to Load Media Files</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Layers size={48} />
        </div>
        <h3>No Media Files Found</h3>
        <p>Try refining your search keyword, changing filters, or uploading a new file.</p>
      </div>
    );
  }

  return (
    <div className="file-grid-wrapper">
      <div className="file-grid">
        {files.map((file) => (
          <FileCard key={file._id} file={file} />
        ))}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="pagination">
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
