import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h2>Create Account</h2>
        <p>Start uploading and managing multimedia assets</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="alert-close">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? <div className="spinner-sm" /> : <UserPlus size={18} />}
          <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
        </button>

        <div className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="btn-link">
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
