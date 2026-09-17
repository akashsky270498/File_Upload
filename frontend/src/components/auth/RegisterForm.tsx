import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck, Phone } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touched, setTouched] = useState<{
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateField = (
    field: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword',
    val: string
  ) => {
    const newErrors = { ...errors };

    if (field === 'firstName') {
      if (!val.trim()) {
        newErrors.firstName = 'First name is required.';
      } else {
        delete newErrors.firstName;
      }
    }

    if (field === 'lastName') {
      if (!val.trim()) {
        newErrors.lastName = 'Last name is required.';
      } else {
        delete newErrors.lastName;
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
      } else if (val.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      } else {
        delete newErrors.password;
      }
    }

    if (field === 'confirmPassword') {
      if (!val) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (val !== password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });
    const errFirst = validateField('firstName', firstName);
    const errLast = validateField('lastName', lastName);
    const errEmail = validateField('email', email);
    const errPass = validateField('password', password);
    const errConfirm = validateField('confirmPassword', confirmPassword);

    if (errFirst.firstName || errLast.lastName || errEmail.email || errPass.password || errConfirm.confirmPassword) {
      return;
    }

    dispatch(
      registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        mobileNumber: mobileNumber.trim() || undefined,
      })
    );
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label>First Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => validateField('firstName', firstName)}
                className={touched.firstName && errors.firstName ? 'input-error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Mercer"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => validateField('lastName', lastName)}
                className={touched.lastName && errors.lastName ? 'input-error' : ''}
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateField('email', email)}
              className={touched.email && errors.email ? 'input-error' : ''}
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label>Mobile Number (Optional)</label>
          <div className="input-wrapper">
            <Phone size={18} className="input-icon" />
            <input
              type="text"
              placeholder="+14155552671"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Min 8 characters (1 upper, 1 lower, 1 symbol)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validateField('password', password)}
              className={touched.password && errors.password ? 'input-error' : ''}
            />
          </div>
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
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
