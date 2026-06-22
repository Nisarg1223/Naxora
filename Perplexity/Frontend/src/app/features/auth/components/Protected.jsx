import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';
import './Protected.scss';

const Protected = ({children}) => {
    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);

    if(loading){
        return (
            <div className="auth-loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">
                        {"NEXORA".split("").map((letter, index) => (
                            <span key={index} style={{ animationDelay: `${index * 0.08}s` }}>
                                {letter}
                            </span>
                        ))}
                    </div>
                    <div className="loading-copy">
                        Loading
                        <span className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if(!user){
        return <Navigate to="/login" replace/>
    }

  return children;
}

export default Protected