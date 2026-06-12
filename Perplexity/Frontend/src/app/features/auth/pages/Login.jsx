import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.scss';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
const Login = () => {
    const [email,setemail] = useState('');
    const [password,setpassword] = useState('');
    const user = useSelector(state =>state.auth.user);
    const loading = useSelector(state => state.auth.loading);
    const {handleLogin} = useAuth();
    const navigate = useNavigate();
    if(!loading && user){
        return <Navigate to="/" replace/>
    }
    const submitForm = async(e)=>{
        e.preventDefault();
        const payload = {
            email,
            password
        }
        const success = await handleLogin(payload);
        if (success) {
            navigate("/");
        }
    }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue to Perplexity</p>

        <form className="auth-form" onSubmit={function(e){
            submitForm(e);
        }}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setemail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        <div className="divider">or continue with</div>

        <div className="social-login">
          <button type="button" className="btn-social">
            {/* SVG inline for a simple generic G icon to avoid needing an image file */}
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className="btn-social">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;