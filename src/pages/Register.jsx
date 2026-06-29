import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';

function Register() {
  const navigate = useNavigate();
  const [preview, setPreview]   = useState(null);  // image preview URL
  const [imageFile, setImageFile] = useState(null); // actual file for upload
  const [loading, setLoading]   = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch password so we can compare in "confirm password" rule
  const password = watch('password');

  // ── Image selection handler ──────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setImageFile(file);
    // Create a local URL for instant preview (no upload yet)
    setPreview(URL.createObjectURL(file));
  };

  // ── Form submit ──────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Use FormData because we're sending a file + text together
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      await API.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Registered! Check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="auth-card">
      <h2>Create Account</h2>

      {/* Profile image upload with preview */}
      <div className="avatar-upload">
        {preview ? (
          <img src={preview} alt="Preview" className="avatar-preview" />
        ) : (
          <div
            className="avatar-placeholder"
            onClick={() => document.getElementById('profileImageInput').click()}
          >
            📷
          </div>
        )}
        <input
          type="file"
          id="profileImageInput"
          accept="image/*"
          onChange={handleImageChange}
        />
        <label htmlFor="profileImageInput">
          {preview ? 'Change photo' : 'Upload profile photo'}
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          {errors.name && <span className="error-msg">{errors.name.message}</span>}
        </div>

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
            placeholder="Min. 6 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)/,
                message: 'Password must contain at least one letter and one number',
              },
            })}
          />
          {errors.password && <span className="error-msg">{errors.password.message}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) =>
                val === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <span className="error-msg">{errors.confirmPassword.message}</span>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}

export default Register;