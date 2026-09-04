import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateField = (field: 'email' | 'password', value: string) => {
    const newErrors = { ...errors };

    if (field === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(value.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'password') {
      if (!value) {
        newErrors.password = 'Password is required.';
      } else if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'email' ? email : password;
    validateField(field, val);
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    const errEmail = validateField('email', email);
    const errPassword = validateField('password', password);

    if (errEmail.email || errPassword.password) {
      return;
    }

    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access secure multimedia search and storage</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="alert-close">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Email Address */}
        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={touched.email && errors.email ? 'input-error' : ''}
            />
          </div>
          {touched.email && errors.email && (
            <div className="field-error">
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={touched.password && errors.password ? 'input-error' : ''}
            />
          </div>
          {touched.password && errors.password && (
            <div className="field-error">
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? <div className="spinner-sm" /> : <LogIn size={18} />}
          <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
        </button>

        <div className="auth-switch">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} className="btn-link">
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};
