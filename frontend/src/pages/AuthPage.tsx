// ==========================================
// 🔐 AUTHENTICATION PAGE COMPONENT
// ==========================================
// Ye component Login (Password & OTP), Registration, aur Forgot/Reset Password flows UI handle karta hai.

import React, { useState } from 'react';
import { Mail, Lock, Layers, LogIn, KeyRound, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginUser,
  requestLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  clearError,
  resetOtpState,
  setForgotPasswordStep,
} from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { RegisterForm } from '../components/auth/RegisterForm';

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
type LoginMethod = 'PASSWORD' | 'OTP';

export const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, otpSent, forgotPasswordStep } = useAppSelector((state) => state.auth);
  const reduxOtpEmail = useAppSelector((state) => state.auth.otpEmail);

  const [authView, setAuthView] = useState<AuthView>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('PASSWORD');

  // Form input states
  const [email, setEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // OTP send hone par active login method switch karne ka effect
  React.useEffect(() => {
    if (otpSent) {
      setLoginMethod('OTP');
      const activeEmail = reduxOtpEmail || otpEmail;
      if (activeEmail && !email) {
        setEmail(activeEmail);
      }
    }
  }, [otpSent, reduxOtpEmail, otpEmail, email]);

  // 1. Password Login Submit Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Authentication successful! Welcome back.', type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Login failed.', type: 'error' }));
    }
  };

  // 2. Request OTP Code Handler
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const targetEmail = email.trim();
    if (!targetEmail) return;
    setOtpEmail(targetEmail);
    const result = await dispatch(requestLoginOtp(targetEmail));
    if (requestLoginOtp.fulfilled.match(result)) {
      dispatch(showToast({ message: result.payload, type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Failed to request OTP.', type: 'error' }));
    }
  };

  // 3. Verify OTP Code Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const targetEmail = (email || reduxOtpEmail || otpEmail || '').trim();
    if (!targetEmail) {
      dispatch(showToast({ message: 'Email address is required for OTP verification.', type: 'error' }));
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      dispatch(showToast({ message: 'Please enter a valid 6-digit OTP code.', type: 'error' }));
      return;
    }
    const result = await dispatch(verifyLoginOtp({ email: targetEmail, otp: otp.trim() }));
    if (verifyLoginOtp.fulfilled.match(result)) {
      dispatch(showToast({ message: 'OTP verified! Welcome back.', type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Invalid OTP.', type: 'error' }));
    }
  };

  // 4. Forgot Password Request Handler
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      dispatch(showToast({ message: result.payload, type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Request failed.', type: 'error' }));
    }
  };

  // 5. Reset Password Submit Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(resetPassword({ email, otp, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      dispatch(showToast({ message: result.payload, type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Reset failed.', type: 'error' }));
    }
  };

  // Switch View Helper (Login / Register / Forgot Password)
  const switchView = (view: AuthView) => {
    setAuthView(view);
    dispatch(clearError());
    dispatch(resetOtpState());
    dispatch(setForgotPasswordStep('REQUEST'));
  };

  return (
    <div className="auth-page">
      <div
        className="auth-container"
        style={{
          maxWidth: authView === 'REGISTER' ? '580px' : '440px',
          transition: 'max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="auth-brand">
          <div className="brand-icon-lg">
            <Layers size={36} />
          </div>
          <h1 className="brand-title">OmniMedia</h1>
          <p className="brand-subtitle">Multimedia Strategy Stream, Search & CDN Platform</p>
        </div>

        <div className="auth-card">
          {/* Main Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`btn-tab ${authView === 'LOGIN' ? 'active' : ''}`}
              onClick={() => switchView('LOGIN')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                color: authView === 'LOGIN' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                borderBottom: authView === 'LOGIN' ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn-tab ${authView === 'REGISTER' ? 'active' : ''}`}
              onClick={() => switchView('REGISTER')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                color: authView === 'REGISTER' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                borderBottom: authView === 'REGISTER' ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>{error}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {authView === 'LOGIN' && (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--bg-glass)', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('PASSWORD'); dispatch(resetOtpState()); }}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: loginMethod === 'PASSWORD' ? 'var(--primary)' : 'transparent',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('OTP'); }}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: loginMethod === 'OTP' ? 'var(--primary)' : 'transparent',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Email OTP Login
                </button>
              </div>

              {loginMethod === 'PASSWORD' ? (
                <form onSubmit={handlePasswordLogin}>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ margin: 0 }}>Password *</label>
                      <button
                        type="button"
                        onClick={() => switchView('FORGOT_PASSWORD')}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Forgot Password?
                      </button>
                    </div>
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
                    <LogIn size={18} />
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  </button>
                </form>
              ) : (
                /* OTP LOGIN FORM */
                !otpSent ? (
                  <form onSubmit={handleRequestOtp}>
                    <div className="form-group">
                      <label>Email Address for OTP *</label>
                      <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                          type="email"
                          placeholder="alex@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                      <KeyRound size={18} />
                      <span>{isLoading ? 'Sending OTP...' : 'Send 6-Digit OTP Code'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                          type="email"
                          placeholder="alex@example.com"
                          value={email || reduxOtpEmail || otpEmail || ''}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Enter 6-Digit Verification Code *</label>
                      <div className="input-wrapper">
                        <ShieldCheck size={18} className="input-icon" />
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          autoFocus
                          required
                        />
                      </div>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        OTP code sent to <b>{email || reduxOtpEmail || otpEmail}</b>. Valid for 5 minutes.
                      </small>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                      <LogIn size={18} />
                      <span>{isLoading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                    </button>
                  </form>
                )
              )}
            </>
          )}

          {/* VIEW 2: REGISTER */}
          {authView === 'REGISTER' && (
            <RegisterForm onSwitchToLogin={() => switchView('LOGIN')} />
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {authView === 'FORGOT_PASSWORD' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#ef4444' }}>
                  <KeyRound size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Reset Your Password</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {forgotPasswordStep === 'REQUEST' && 'Enter your registered email to receive a 6-digit OTP code.'}
                  {forgotPasswordStep === 'VERIFY' && 'Enter the 6-digit OTP code sent to your email and set a new password.'}
                  {forgotPasswordStep === 'SUCCESS' && 'Your password has been successfully reset! You can now log in.'}
                </p>
              </div>

              {forgotPasswordStep === 'REQUEST' && (
                <form onSubmit={handleForgotPasswordRequest}>
                  <div className="form-group">
                    <label>Registered Email Address *</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                    <KeyRound size={18} />
                    <span>{isLoading ? 'Requesting OTP...' : 'Send Password Reset OTP'}</span>
                  </button>
                </form>
              )}

              {forgotPasswordStep === 'VERIFY' && (
                <form onSubmit={handleResetPasswordSubmit}>
                  <div className="form-group">
                    <label>6-Digit OTP Code *</label>
                    <div className="input-wrapper">
                      <ShieldCheck size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password *</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        placeholder="NewSecurePass123!"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                    <ShieldCheck size={18} />
                    <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
                  </button>
                </form>
              )}

              {forgotPasswordStep === 'SUCCESS' && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => switchView('LOGIN')}
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => switchView('LOGIN')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

