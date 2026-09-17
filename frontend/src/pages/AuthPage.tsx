import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Layers, LogIn, UserPlus, KeyRound, ShieldCheck, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginUser,
  registerUser,
  requestLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  clearError,
  resetOtpState,
  setForgotPasswordStep,
} from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { COUNTRY_CODES } from '../data/countryCodes';

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
type LoginMethod = 'PASSWORD' | 'OTP';

export const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, otpSent, forgotPasswordStep } = useAppSelector((state) => state.auth);

  const [authView, setAuthView] = useState<AuthView>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('PASSWORD');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Authentication successful! Welcome back.', type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Login failed.', type: 'error' }));
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(requestLoginOtp(email));
    if (requestLoginOtp.fulfilled.match(result)) {
      dispatch(showToast({ message: result.payload, type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Failed to request OTP.', type: 'error' }));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(verifyLoginOtp({ email, otp }));
    if (verifyLoginOtp.fulfilled.match(result)) {
      dispatch(showToast({ message: 'OTP verified! Welcome back.', type: 'success' }));
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Invalid OTP.', type: 'error' }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const cleanedDigits = phoneDigits.replace(/\D/g, '');
    if (!cleanedDigits || cleanedDigits.length < 7) {
      dispatch(showToast({ message: 'Please enter a valid mobile number.', type: 'error' }));
      return;
    }

    const fullMobileNumber = `${countryCode}${cleanedDigits}`;

    const result = await dispatch(
      registerUser({
        email,
        password,
        firstName,
        lastName,
        mobileNumber: fullMobileNumber,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Registration successful! Please log in.', type: 'success' }));
      setAuthView('LOGIN');
      setLoginMethod('PASSWORD');
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Registration failed.', type: 'error' }));
    }
  };

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

  const switchView = (view: AuthView) => {
    setAuthView(view);
    dispatch(clearError());
    dispatch(resetOtpState());
    dispatch(setForgotPasswordStep('REQUEST'));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
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
                      <label>Enter 6-Digit Verification Code *</label>
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
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        OTP code sent to <b>{email}</b>. Valid for 5 minutes.
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
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>First Name *</label>
                  <div className="input-wrapper">
                    <UserIcon size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <div className="input-wrapper">
                    <UserIcon size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Mercer"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

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
                <label>Mobile Number *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      background: 'var(--bg-glass)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code} style={{ background: '#121826', color: '#ffffff' }}>
                        {item.flag} {item.code} ({item.country})
                      </option>
                    ))}
                  </select>

                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value)}
                      required
                    />
                  </div>
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
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol.
                </small>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                <UserPlus size={18} />
                <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
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
