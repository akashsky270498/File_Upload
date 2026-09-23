// ==========================================
// 💻 FRONTEND ROOT COMPONENT (App.tsx)
// ==========================================
// Ye Frontend Application ka Root Component hai. Yahan User Authentication check,
// Theme switching, Global Notifications (Toasts), aur Routing logic handle hoti hai.

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchCurrentUser, resetAuth } from './store/slices/authSlice';
import { showToast } from './store/slices/uiSlice';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { GlobalToast } from './components/common/GlobalToast';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, token, user } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);

  // 1. Dark / Light Theme sync effect (HTML element par attribute update karta hai)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 2. Page reload hone par User Session restore effect (HttpOnly cookie ke through 'me' profile query fetch karta hai)
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // 3. Global Auth Logout Listener (Agar refresh token expire ya invalid ho jaye toh automatic logout trigger karta hai)
  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(resetAuth());
      dispatch(showToast({ message: 'Session expired. Please log in again.', type: 'error' }));
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [dispatch]);

  // 4. Initial Loader Screen (Jab tak session fetch ho raha hai)
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading OmniMedia Platform...</p>
      </div>
    );
  }

  // 5. Main View: Logged in hai toh DashboardPage, warna AuthPage (Login/Register)
  return (
    <>
      <GlobalToast />
      {isAuthenticated ? <DashboardPage /> : <AuthPage />}
    </>
  );
};

export default App;

