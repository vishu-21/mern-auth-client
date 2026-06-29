import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>MyApp</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/" style={styles.link}>Users</Link>
            <Link to="/profile" style={styles.link}>My Profile</Link>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 32px', background: '#1a1a2e', color: '#fff',
  },
  brand: { color: '#6c63ff', fontWeight: 700, fontSize: '1.3rem', textDecoration: 'none' },
  links: { display: 'flex', gap: 20, alignItems: 'center' },
  link: { color: '#ccc', textDecoration: 'none', fontSize: '0.92rem' },
  logoutBtn: {
    background: 'transparent', border: '1.5px solid #6c63ff',
    color: '#6c63ff', padding: '6px 16px', borderRadius: 6,
    cursor: 'pointer', fontSize: '0.88rem',
  },
};

export default Navbar;