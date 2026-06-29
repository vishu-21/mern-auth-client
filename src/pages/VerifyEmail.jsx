import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await API.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      {status === 'verifying' && (
        <>
          <div style={spinner} />
          <p style={{ marginTop: 20, color: '#666' }}>Verifying your email...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '3rem' }}>✅</div>
          <h2 style={{ marginTop: 16 }}>Email Verified!</h2>
          <p style={{ color: '#666', marginTop: 8 }}>
            Your account is active. You can now log in.
          </p>
          <Link to="/login" className="btn-primary" style={linkBtnStyle}>
            Go to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '3rem' }}>❌</div>
          <h2 style={{ marginTop: 16 }}>Verification Failed</h2>
          <p style={{ color: '#666', marginTop: 8 }}>
            The link is invalid or has expired.
          </p>
          <Link to="/register" className="btn-primary" style={linkBtnStyle}>
            Register again
          </Link>
        </>
      )}
    </div>
  );
}

const spinner = {
  width: 48, height: 48, borderRadius: '50%',
  border: '4px solid #e8e6ff',
  borderTop: '4px solid #6c63ff',
  animation: 'spin 0.8s linear infinite',
  margin: '0 auto',
};

const linkBtnStyle = {
  display: 'block', marginTop: 24, textDecoration: 'none',
  textAlign: 'center', padding: '12px', borderRadius: 8,
  background: '#6c63ff', color: '#fff', fontWeight: 600,
};

export default VerifyEmail;