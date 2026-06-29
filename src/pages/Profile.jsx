import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user: currentUser, login, token } = useAuth();
  const [searchParams] = useSearchParams();
  const viewingId = searchParams.get('id'); // null = own profile

  const isOwnProfile = !viewingId || viewingId === String(currentUser?.id);

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // ── Load profile data ──────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const endpoint = viewingId ? `/users/${viewingId}` : '/users/me';
        const res = await API.get(endpoint);
        setProfile(res.data.user);
        // Pre-fill form fields
        reset({ name: res.data.user.name, email: res.data.user.email });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [viewingId, reset]);

  // ── Image change ───────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Invalid file type'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Save profile ───────────────────────────────────────────────
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (imageFile) formData.append('profileImage', imageFile);

      const res = await API.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update global auth context with new user data
      login(res.data.user, token);
      setProfile(res.data.user);
      setEditing(false);
      setImageFile(null);
      setPreview(null);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setPreview(null);
    setImageFile(null);
    reset({ name: profile.name, email: profile.email });
  };

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  if (!profile) return null;

  const avatarSrc = preview
    || (profile.profileImage ? `http://localhost:5000/${profile.profileImage}` : null)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6c63ff&color=fff&size=128`;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Avatar section */}
        <div style={styles.avatarSection}>
          <img src={avatarSrc} alt={profile.name} style={styles.avatar} />

          {/* Only show upload option when editing own profile */}
          {isOwnProfile && editing && (
            <div style={{ marginTop: 10 }}>
              <input
                type="file"
                id="profileImg"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="profileImg" style={styles.changePhotoBtn}>
                Change photo
              </label>
            </div>
          )}

          <span style={{
            ...styles.badge,
            background: profile.role === 'admin' ? '#6c63ff' : '#e8e6ff',
            color: profile.role === 'admin' ? '#fff' : '#6c63ff',
            marginTop: 10,
          }}>
            {profile.role}
          </span>
        </div>

        {/* Profile info / edit form */}
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
              />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>

            {/* Email is read-only — changing email needs re-verification */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                {...register('email')}
                disabled
                style={{ background: '#f4f4f4', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                Email cannot be changed
              </span>
            </div>

            <div style={styles.btnRow}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.infoSection}>
            <h2 style={styles.name}>{profile.name}</h2>
            <p style={styles.email}>{profile.email}</p>
            <p style={styles.meta}>
              Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>

            {/* Only show edit button on own profile */}
            {isOwnProfile && (
              <button
                style={styles.editBtn}
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = {
  container: { maxWidth: 520, margin: '50px auto', padding: '0 20px' },
  card: {
    background: '#fff', borderRadius: 16, padding: 40,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #6c63ff' },
  changePhotoBtn: {
    color: '#6c63ff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  badge: { padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 },
  infoSection: { textAlign: 'center', width: '100%' },
  name: { fontSize: '1.5rem', color: '#1a1a2e', marginBottom: 6 },
  email: { color: '#888', fontSize: '0.95rem', marginBottom: 8 },
  meta: { color: '#bbb', fontSize: '0.82rem', marginBottom: 24 },
  editBtn: {
    padding: '10px 28px', background: '#6c63ff', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
  },
  form: { width: '100%' },
  btnRow: { display: 'flex', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, padding: 12, border: '1.5px solid #ddd',
    background: '#fff', borderRadius: 8, cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: 600, color: '#666',
  },
};

const spinnerStyle = {
  width: 44, height: 44, borderRadius: '50%',
  border: '4px solid #e8e6ff', borderTop: '4px solid #6c63ff',
  animation: 'spin 0.8s linear infinite',
};

export default Profile;