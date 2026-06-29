import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/Navbar';

// Lazy-loaded pages (as required by the spec)
const Register        = lazy(() => import('./pages/Register'));
const Login           = lazy(() => import('./pages/Login'));
const VerifyEmail     = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword   = lazy(() => import('./pages/ResetPassword'));
const UserList        = lazy(() => import('./pages/UserList'));
const Profile         = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/register"         element={<Register />} />
          <Route path="/login"            element={<Login />} />
          <Route path="/verify-email"     element={<VerifyEmail />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/reset-password"   element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/"        element={<UserList />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;