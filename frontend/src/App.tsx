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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Restore user session on app load or refresh via HttpOnly cookie
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // Listen for refresh token failure events
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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading OmniMedia Platform...</p>
      </div>
    );
  }

  return (
    <>
      <GlobalToast />
      {isAuthenticated ? <DashboardPage /> : <AuthPage />}
    </>
  );
};

export default App;
