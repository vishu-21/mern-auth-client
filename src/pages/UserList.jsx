import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function UserList() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6; // users per page

  // ── Fetch users ────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/users', {
        params: { page, limit: LIMIT, search },
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Re-fetch whenever page or search changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Debounce search input ──────────────────────────────────────
  // Reset to page 1 whenever user types a new search
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ── Admin: delete a user ───────────────────────────────────────
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${userId}`);
      toast.success('User deleted');
      fetchUsers(); // refresh list
    } catch {
      toast.error('Failed to delete user');
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>All Users</h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
          style={styles.searchInput}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div style={styles.center}>
          <div style={spinnerStyle} />
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div style={styles.center}>
          <p style={{ color: '#888' }}>No users found.</p>
        </div>
      )}

      {/* User grid */}
      {!loading && users.length > 0 && (
        <div style={styles.grid}>
          {users.map((u) => (
            <div key={u.id} style={styles.card}>

              {/* Avatar */}
              <img
                src={
                  u.profileImage
                    ? `http://localhost:5000/${u.profileImage}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6c63ff&color=fff`
                }
                alt={u.name}
                style={styles.avatar}
              />

              {/* Info */}
              <div style={styles.info}>
                <h3 style={styles.name}>{u.name}</h3>
                <p style={styles.email}>{u.email}</p>
                <span style={{
                  ...styles.badge,
                  background: u.role === 'admin' ? '#6c63ff' : '#e8e6ff',
                  color: u.role === 'admin' ? '#fff' : '#6c63ff',
                }}>
                  {u.role}
                </span>
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <button
                  style={styles.viewBtn}
                  onClick={() => navigate(`/profile?id=${u.id}`)}
                >
                  View
                </button>

                {/* Only show delete for admin users */}
                {currentUser?.role === 'admin' && currentUser.id !== u.id && (
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              style={{
                ...styles.pageBtn,
                background: p === page ? '#6c63ff' : '#fff',
                color: p === page ? '#fff' : '#333',
                fontWeight: p === page ? 700 : 400,
              }}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            style={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = {
  container: { maxWidth: 900, margin: '40px auto', padding: '0 20px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12,
  },
  title: { fontSize: '1.5rem', color: '#1a1a2e' },
  searchInput: {
    padding: '10px 16px', border: '1.5px solid #ddd',
    borderRadius: 8, fontSize: '0.92rem', width: 280, outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  avatar: { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e8e6ff' },
  info: { textAlign: 'center' },
  name: { fontSize: '1rem', color: '#1a1a2e', marginBottom: 4 },
  email: { fontSize: '0.82rem', color: '#888', marginBottom: 8 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  viewBtn: {
    padding: '7px 18px', border: '1.5px solid #6c63ff',
    background: 'transparent', color: '#6c63ff', borderRadius: 6,
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
  },
  deleteBtn: {
    padding: '7px 18px', border: 'none',
    background: '#ff4d4f', color: '#fff', borderRadius: 6,
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
  },
  pagination: { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 },
  pageBtn: {
    padding: '8px 14px', border: '1.5px solid #ddd',
    borderRadius: 6, cursor: 'pointer', fontSize: '0.88rem',
    background: '#fff', transition: 'all 0.15s',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
};

const spinnerStyle = {
  width: 40, height: 40, borderRadius: '50%',
  border: '4px solid #e8e6ff', borderTop: '4px solid #6c63ff',
  animation: 'spin 0.8s linear infinite',
};

export default UserList;