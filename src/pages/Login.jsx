import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', data);

      // Backend returns { user, accessToken }
      login(res.data.user, res.data.accessToken);

      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Email */}
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

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Your password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
          {errors.password && <span className="error-msg">{errors.password.message}</span>}
        </div>

        {/* Forgot password link */}
        <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: '0.82rem', color: '#6c63ff', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        {/* Google OAuth button — wired up when backend is ready */}
        <button
          type="button"
          style={googleBtnStyle}
          onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            style={{ marginRight: 10 }}
          />
          Continue with Google
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}

const googleBtnStyle = {
  width: '100%',
  padding: '11px',
  marginTop: 12,
  background: '#fff',
  border: '1.5px solid #ddd',
  borderRadius: 8,
  fontSize: '0.95rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  color: '#444',
};

export default Login;