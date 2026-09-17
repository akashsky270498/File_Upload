import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveNotification, addNotificationToHistory, addLiveFile, removeLiveFile } from '../store/slices/filesSlice';
import { RealtimeFileNotification, MediaFile } from '../types/file';
import { SOCKET_URL } from '../config/env.config';

let socket: Socket | null = null;

export const useSocket = (): void => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    if (!socket || !socket.connected) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to real-time notification server');
    });

    const handleNotification = (payload: any) => {
      const uploaderName =
        payload.uploaderName ||
        (payload.user ? `${payload.user.firstName || ''} ${payload.user.lastName || ''}`.trim() : 'System');

      const formatted: RealtimeFileNotification = {
        fileId: payload.fileId || payload.id || 'notif',
        title: payload.title || payload.subject || 'Media Asset Published',
        fileType: payload.fileType || 'MEDIA',
        url: payload.cloudinaryUrl || payload.url || '',
        uploaderName: uploaderName || 'System',
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      dispatch(setActiveNotification(formatted));
      dispatch(addNotificationToHistory(formatted));

      setTimeout(() => {
        dispatch(setActiveNotification(null));
      }, 5000);

      // Add to live media feed immediately if file object is present
      if (payload.id && payload.cloudinaryUrl) {
        const liveFile: MediaFile = {
          id: payload.id,
          _id: payload.id,
          userId: payload.userId,
          originalName: payload.originalName || payload.title,
          title: payload.title,
          description: payload.description,
          fileType: payload.fileType,
          mimeType: payload.mimeType || '',
          size: payload.size || 0,
          cloudinaryId: payload.cloudinaryPublicId || payload.cloudinaryId || '',
          cloudinaryUrl: payload.cloudinaryUrl,
          url: payload.cloudinaryUrl || '',
          secureUrl: payload.cloudinaryUrl || '',
          tags: payload.tags || [],
          viewsCount: payload.viewsCount || 0,
          createdAt: payload.createdAt,
          user: payload.user,
        };
        dispatch(addLiveFile(liveFile));
      }
    };

    const handleFileDeleted = (payload: any) => {
      const deletedId = payload?.id || payload?.fileId;
      if (deletedId) {
        dispatch(removeLiveFile(deletedId));
      }
    };

    socket.on('notification:new', handleNotification);
    socket.on('media:processed', handleNotification);
    socket.on('file:uploaded', handleNotification);
    socket.on('MEDIA_UPLOADED', handleNotification);
    socket.on('file:deleted', handleFileDeleted);
    socket.on('MEDIA_DELETED', handleFileDeleted);

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('notification:new');
        socket.off('media:processed');
        socket.off('file:uploaded');
        socket.off('MEDIA_UPLOADED');
        socket.off('file:deleted');
        socket.off('MEDIA_DELETED');
      }
    };
  }, [dispatch, isAuthenticated]);
};

