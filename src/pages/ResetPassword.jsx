import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });

      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Link may have expired.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Guard: if no token in URL, show error immediately
  if (!token) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ marginTop: 16 }}>Invalid Link</h2>
        <p style={{ color: '#666', marginTop: 8 }}>
          This password reset link is invalid or has expired.
        </p>
        <Link to="/forgot-password" style={{ color: '#6c63ff', marginTop: 16, display: 'block' }}>
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Reset Password</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 24, textAlign: 'center' }}>
        Choose a strong new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* New password */}
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)/,
                message: 'Must contain at least one letter and one number',
              },
            })}
          />
          {errors.password && <span className="error-msg">{errors.password.message}</span>}
        </div>

        {/* Confirm new password */}
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            placeholder="Re-enter new password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <span className="error-msg">{errors.confirmPassword.message}</span>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;