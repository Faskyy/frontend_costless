import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/1_nb.png'; // Update the path based on your project structure

function LandingComponent() {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [backgroundSize, setBackgroundSize] = useState('50%');
  const [backgroundPosition, setBackgroundPosition] = useState('left bottom');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setBackgroundSize('50%');
        setBackgroundPosition('center 5%'); // Move the image slightly more to the top
      } else {
        setBackgroundSize('50%');
        setBackgroundPosition('left bottom');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Disable scrolling on the body element

    return () => {
      document.body.style.overflow = 'auto'; // Enable scrolling on cleanup
    };
  }, []);

  const handleLogin = () => {
    loginWithRedirect({
      redirect_uri: `${window.location.origin}/`, // Update the redirect URI
    });
  };

  const handlePrivacyClick = () => {
    navigate('/privacy');
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        position: 'relative',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: backgroundSize,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: backgroundPosition,
      }}
    >
      <div className="text-center">
        <h1 className="display-4">Discover the city, Costless</h1>
        <p className="lead">Uncover free events and experiences in your city, today.</p>
        <button onClick={handleLogin} className="btn btn-primary mt-3">
          Start Exploring! 🚀
        </button>
        <br />
        <br />
        <p className="mt-3 light-text">
          Email us at <a href="mailto:hello@costless.app">hello@costless.app</a> for any inquiries or suggestions.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          color: 'gray',
        }}
      >
        <button onClick={handlePrivacyClick} style={{ textDecoration: 'none', color: 'gray', border: 'none', background: 'none', cursor: 'pointer' }}>
          Privacy
        </button>
        <span style={{ margin: '0 0.5rem' }}>|</span>
        <span>Created with ❤</span>
      </div>
    </div>
  );
}

export default LandingComponent;
