import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from "@auth0/auth0-react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapComponent from './components/Map';
import LandingComponent from './components/Landing';
import './App.css';

function App() {
  console.log("Redirect URI:", `${window.location.origin}/map`);
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: `${window.location.origin}/map` }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LandingComponent />} />
          <Route path="/map" element={<MapComponent />} />
        </Routes>
      </Router>
      <ToastContainer position="top-center"/>
    </Auth0Provider>
  );
}

export default App;
