import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Show success state after email is sent
  if (sent) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>📧</div>
        <h2 style={{ marginTop: 16 }}>Check your inbox</h2>
        <p style={{ color: '#666', marginTop: 8, lineHeight: 1.6 }}>
          We've sent a password reset link to your email address.
          The link expires in 15 minutes.
        </p>
        <Link to="/login" style={{ color: '#6c63ff', marginTop: 20, display: 'block' }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 24, textAlign: 'center' }}>
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="john@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && <span className="error-msg">{errors.email.message}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="auth-footer">
        Remember your password? <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;