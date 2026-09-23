// ==========================================
// 📊 DASHBOARD PAGE COMPONENT
// ==========================================
// Ye component Logged-in User Dashboard render karta hai (Navbar, Search Filters, File Grid Feed, Upload Modal, Preview Modal, Real-time WebSockets).

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

  // 1. Socket.io Real-time WebSocket event listener initialization
  useSocket();

  // 2. Debounce Search Input (350ms delay fast typing performance optimization ke liye)
  const debouncedQuery = useDebounce(filters.query, 350);

  // 3. Search Query / Filters change hone par Files list refetch effect
  useEffect(() => {
    dispatch(fetchFiles({ ...filters, query: debouncedQuery }));
  }, [dispatch, debouncedQuery, filters.fileType, filters.sortBy, filters.page]);

  return (
    <div className="dashboard-layout">
      {/* Top Navbar Header */}
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />
      <ToastNotification />
      <GlobalToast />
      <ConfirmModal />

      {/* Main Files Feed Section */}
      <main className="dashboard-content">
        <div className="content-container">
          <FileFilterBar />
          <FileGrid onOpenUpload={() => setIsUploadOpen(true)} />
        </div>
      </main>

      {/* Upload Asset Modal & Inline PDF/Media Preview Modals */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <MediaPreviewModal />
    </div>
  );
};

