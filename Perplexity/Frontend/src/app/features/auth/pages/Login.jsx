import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { setError } from '../../../auth.slice';
import './auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  const dispatch = useDispatch();
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const submitForm = async (e) => {
    e.preventDefault();
    dispatch(setError(null));
    const success = await handleLogin({ email, password });
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left side: Premium Image Banner */}
      <div 
        className="auth-left-banner" 
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1)), url('/auth_banner.jpg')` }}
      >
        <div className="banner-overlay-content">
          <div className="banner-tag">
            <span className="dot">•</span> NEXORA AI
          </div>
          <h2 className="banner-heading">Query Your Future</h2>
        </div>
      </div>

      {/* Right side: Dark Form Panel */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {/* Logo Header */}
          <div className="auth-logo-header">
            <img src="/logo_nexora.png" alt="Nexora AI" className="auth-brand-logo" />
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to query the future</p>

          {error && (
            <motion.div 
              className="auth-error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </motion.div>
          )}

          <form className="auth-form-element" onSubmit={submitForm}>
            <div className="auth-input-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="darjinisarg49@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-spinner"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer-note">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;