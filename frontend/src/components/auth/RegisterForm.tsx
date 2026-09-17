import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { showToast } from '../../store/slices/uiSlice';
import { PhoneInput } from '../common/PhoneInput';


interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,14}$/;

const getPasswordStrength = (pass: string) => {
  if (!pass) {
    return {
      score: 0,
      label: '',
      color: 'transparent',
      checks: { length: false, upper: false, lower: false, number: false, special: false },
    };
  }

  const checks = {
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[^A-Za-z0-9]/.test(pass),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label = 'Very Weak';
  let color = '#ef4444'; // Red

  if (score === 2) {
    label = 'Weak';
    color = '#f97316'; // Orange
  } else if (score === 3) {
    label = 'Medium';
    color = '#eab308'; // Yellow
  } else if (score === 4) {
    label = 'Strong';
    color = '#22c55e'; // Green
  } else if (score === 5) {
    label = 'Very Strong';
    color = '#10b981'; // Emerald Green
  }

  return { score, label, color, checks };
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState<{
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
    phoneDigits?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneDigits?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordStrength = getPasswordStrength(password);

  const validateField = (
    field: 'firstName' | 'lastName' | 'email' | 'phoneDigits' | 'password' | 'confirmPassword',
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

    if (field === 'phoneDigits') {
      const cleaned = val.replace(/\D/g, '');
      if (!cleaned) {
        newErrors.phoneDigits = 'Mobile number is required.';
      } else if (!PHONE_REGEX.test(cleaned)) {
        newErrors.phoneDigits = 'Please enter a valid mobile number (7-14 digits).';
      } else {
        delete newErrors.phoneDigits;
      }
    }

    if (field === 'password') {
      const strength = getPasswordStrength(val);
      if (!val) {
        newErrors.password = 'Password is required.';
      } else if (val.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      } else if (strength.score < 5) {
        newErrors.password = 'Password must include uppercase, lowercase, number, & special character.';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ firstName: true, lastName: true, email: true, phoneDigits: true, password: true, confirmPassword: true });
    const errFirst = validateField('firstName', firstName);
    const errLast = validateField('lastName', lastName);
    const errEmail = validateField('email', email);
    const errPhone = validateField('phoneDigits', phoneDigits);
    const errPass = validateField('password', password);
    const errConfirm = validateField('confirmPassword', confirmPassword);

    if (errFirst.firstName || errLast.lastName || errEmail.email || errPhone.phoneDigits || errPass.password || errConfirm.confirmPassword) {
      return;
    }

    const fullMobileNumber = `${countryCode}${phoneDigits.replace(/\D/g, '')}`;

    const result = await dispatch(
      registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        mobileNumber: fullMobileNumber,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      dispatch(showToast({ message: 'Registration successful! Please log in.', type: 'success' }));
      onSwitchToLogin();
    } else {
      dispatch(showToast({ message: (result.payload as string) || 'Registration failed.', type: 'error' }));
    }
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
            <label>First Name *</label>
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
            <label>Last Name *</label>
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
          <label>Email Address *</label>
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

        {/* Mandatory Mobile Number with Modern PhoneInput */}
        <div className="form-group">
          <label>Mobile Number *</label>
          <PhoneInput
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            phoneDigits={phoneDigits}
            setPhoneDigits={setPhoneDigits}
            error={touched.phoneDigits ? errors.phoneDigits : undefined}
            onBlur={() => validateField('phoneDigits', phoneDigits)}
          />
          {touched.phoneDigits && errors.phoneDigits && (
            <div className="field-error" style={{ marginTop: '0.25rem' }}>
              <AlertCircle size={14} />
              <span>{errors.phoneDigits}</span>
            </div>
          )}
        </div>

        {/* Password Field with Dynamic Detector */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Password *</label>
            {password && (
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: passwordStrength.color, transition: 'color 0.2s' }}>
                {passwordStrength.label}
              </span>
            )}
          </div>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) validateField('password', e.target.value);
              }}
              onBlur={() => validateField('password', password)}
              className={touched.password && errors.password ? 'input-error' : ''}
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                zIndex: 5,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Dynamic Password Strength Progress Meter */}
          {password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', height: '5px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.08)' }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      height: '100%',
                      background: level <= passwordStrength.score ? passwordStrength.color : 'transparent',
                      borderRadius: '2px',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
              </div>

              {/* Requirements Live Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginTop: '10px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength.checks.length ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordStrength.checks.length ? <Check size={13} /> : <X size={13} />}
                  <span>8+ characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength.checks.upper ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordStrength.checks.upper ? <Check size={13} /> : <X size={13} />}
                  <span>1 Uppercase (A-Z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength.checks.lower ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordStrength.checks.lower ? <Check size={13} /> : <X size={13} />}
                  <span>1 Lowercase (a-z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength.checks.number ? '#10b981' : 'var(--text-muted)' }}>
                  {passwordStrength.checks.number ? <Check size={13} /> : <X size={13} />}
                  <span>1 Number (0-9)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength.checks.special ? '#10b981' : 'var(--text-muted)', gridColumn: 'span 2' }}>
                  {passwordStrength.checks.special ? <Check size={13} /> : <X size={13} />}
                  <span>1 Special symbol (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          {touched.password && errors.password && (
            <div className="field-error" style={{ marginTop: '0.25rem' }}>
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password *</label>
          <div className="input-wrapper">
            <ShieldCheck size={18} className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (touched.confirmPassword) validateField('confirmPassword', e.target.value);
              }}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                zIndex: 5,
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {touched.confirmPassword && errors.confirmPassword && (
            <div className="field-error" style={{ marginTop: '0.25rem' }}>
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

