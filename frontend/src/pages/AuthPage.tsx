import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Layers, LogIn, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, registerUser, clearError } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';

export const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (isLogin) {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        dispatch(showToast({ message: 'Authentication successful! Welcome back.', type: 'success' }));
      } else {
        const errorMsg = (result.payload as string) || 'Invalid email address or password.';
        dispatch(showToast({ message: errorMsg, type: 'error' }));
      }
    } else {
      const result = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(result)) {
        dispatch(showToast({ message: 'User account registered successfully!', type: 'success' }));
      } else {
        const errorMsg = (result.payload as string) || 'Registration failed.';
        dispatch(showToast({ message: errorMsg, type: 'error' }));
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    dispatch(clearError());
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-icon-lg">
            <Layers size={36} />
          </div>
          <h1 className="brand-title">OmniMedia</h1>
          <p className="brand-subtitle">Multimedia Upload, Search & Ranking Platform</p>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{isLogin ? 'Sign In to Account' : 'Create New Account'}</h2>
            <p>
              {isLogin
                ? 'Enter your credentials to access your media assets'
                : 'Sign up to upload, search, and manage your multimedia files'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div className="auth-switch">
            <span>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>{' '}
            <button type="button" className="btn-link" onClick={toggleAuthMode}>
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
