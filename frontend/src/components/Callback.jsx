import { useNavigate } from "react-router-dom";
import React, { useEffect } from 'react';

const Callback = () => {
    const navigate = useNavigate();
  
    useEffect(() => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
  
      if (accessToken) {
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_refresh_token', refreshToken);
        navigate('/'); 
      } else {
        navigate('/callback'); 
      }
    }, [navigate]);
  
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  };
  
  export default Callback;