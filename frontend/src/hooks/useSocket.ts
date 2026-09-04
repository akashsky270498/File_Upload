import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '../store';
import { setActiveNotification, addNotificationToHistory } from '../store/slices/filesSlice';
import { RealtimeFileNotification } from '../types/file';

let socket: Socket | null = null;

export const useSocket = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to notification server');
    });

    socket.on('file:uploaded', (payload: RealtimeFileNotification) => {
      dispatch(setActiveNotification(payload));
      dispatch(addNotificationToHistory(payload));

      // Auto-clear toast alert after 5 seconds
      setTimeout(() => {
        dispatch(setActiveNotification(null));
      }, 5000);
    });

    return () => {
      if (socket) {
        socket.off('file:uploaded');
      }
    };
  }, [dispatch]);
};
