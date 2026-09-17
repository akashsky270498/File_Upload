import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { FileFilterBar } from '../components/files/FileFilterBar';
import { FileGrid } from '../components/files/FileGrid';
import { UploadModal } from '../components/files/UploadModal';
import { MediaPreviewModal } from '../components/preview/MediaPreviewModal';
import { ToastNotification } from '../components/common/ToastNotification';
import { GlobalToast } from '../components/common/GlobalToast';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFiles } from '../store/slices/filesSlice';
import { useDebounce } from '../hooks/useDebounce';
import { useSocket } from '../hooks/useSocket';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.files);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Initialize Socket.io listener
  useSocket();

  // Debounce search query
  const debouncedQuery = useDebounce(filters.query, 350);

  useEffect(() => {
    dispatch(fetchFiles({ ...filters, query: debouncedQuery }));
  }, [dispatch, debouncedQuery, filters.fileType, filters.sortBy, filters.page]);

  return (
    <div className="dashboard-layout">
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />
      <ToastNotification />
      <GlobalToast />
      <ConfirmModal />

      <main className="dashboard-content">
        <div className="content-container">
          <FileFilterBar />
          <FileGrid onOpenUpload={() => setIsUploadOpen(true)} />
        </div>
      </main>


      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <MediaPreviewModal />
    </div>
  );
};
