import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/login';
  };

  return (
    <button onClick={handleLogin}>Login with Spotify</button>
  );
};

export default LoginButton;