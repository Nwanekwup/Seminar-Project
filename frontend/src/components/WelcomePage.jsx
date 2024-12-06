import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage () {
    const navigate = useNavigate();

    const handleLoginPage = () => {
        navigate('/login')
    };

    const handleSignupPage = () => {
        navigate('/signup')
    };

    return (
        <div className="welcome-page">
            <h1>Welcome to RhythME!</h1>
            <button className="welcome-login" onClick={handleLoginPage}>Login</button>
            <button className="welcome-signup" onClick={handleSignupPage}>Sign Up</button>
        </div>    
    );
};

export default WelcomePage;