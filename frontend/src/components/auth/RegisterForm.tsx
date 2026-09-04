import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateField = (
    field: 'name' | 'email' | 'password' | 'confirmPassword',
    val: string,
    allValues?: { name: string; email: string; password: string; confirmPassword: string }
  ) => {
    const newErrors = { ...errors };
    const currentPass = allValues ? allValues.password : password;

    if (field === 'name') {
      if (!val.trim()) {
        newErrors.name = 'Full name is required.';
      } else if (val.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters.';
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'email') {
      if (!val.trim()) {
        newErrors.email = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(val.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      } else {
        delete newErrors.email;
      }
    }

    if (field === 'password') {
      if (!val) {
        newErrors.password = 'Password is required.';
      } else if (val.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      } else {
        delete newErrors.password;
      }

      // Re-validate confirm password if touched
      if (touched.confirmPassword && confirmPassword) {
        if (confirmPassword !== val) {
          newErrors.confirmPassword = 'Passwords do not match.';
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }

    if (field === 'confirmPassword') {
      if (!val) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (val !== currentPass) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'name') val = name;
    if (field === 'email') val = email;
    if (field === 'password') val = password;
    if (field === 'confirmPassword') val = confirmPassword;

    validateField(field, val);
  };

  const handleChange = (field: 'name' | 'email' | 'password' | 'confirmPassword', value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    if (touched[field]) {
      const allVals = {
        name: field === 'name' ? value : name,
        email: field === 'email' ? value : email,
        password: field === 'password' ? value : password,
        confirmPassword: field === 'confirmPassword' ? value : confirmPassword,
      };
      validateField(field, value, allVals);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const allVals = { name, email, password, confirmPassword };

    const errName = validateField('name', name, allVals);
    const errEmail = validateField('email', email, allVals);
    const errPass = validateField('password', password, allVals);
    const errConfirm = validateField('confirmPassword', confirmPassword, allVals);

    if (errName.name || errEmail.email || errPass.password || errConfirm.confirmPassword) {
      return;
    }

    dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
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

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={touched.name && errors.name ? 'input-error' : ''}
            />
          </div>
          {touched.name && errors.name && (
            <div className="field-error">
              <AlertCircle size={14} />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

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
              placeholder="At least 6 characters"
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

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password</label>
          <div className="input-wrapper">
            <ShieldCheck size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
            />
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="field-error">
              <AlertCircle size={14} />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
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
