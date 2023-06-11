import { useState, useMemo, useEffect, useRef } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faDirections, faMapMarker, faHome, faSignOutAlt, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import Clock from './Clock';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MapComponent() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mapViewport, setMapViewport] = useState({
    longitude: -73.9866,
    latitude: 40.7306,
    zoom: 11,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showCurrentLocationPopup, setShowCurrentLocationPopup] = useState(false);
  const isToastDisplayedRef = useRef(false); // ref to track if the toast has been displayed

  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: `${window.location.origin}` });
  };

  const { user } = useAuth0();

  useEffect(() => {
    if (user && user.email_verified && !isToastDisplayedRef.current) {
      const firstName = user.name.split(' ')[0];
      toast.success(`Welcome, ${firstName}!`);
      isToastDisplayedRef.current = true;
    }
  }, [user]);

  const onMarkerClick = (item) => {
    setActiveEvent(null);
    setTimeout(() => {
      setMapViewport({
        ...mapViewport,
        longitude: item.longitude,
        latitude: item.latitude,
        zoom: 16, // Adjust the desired zoom level
      });
      setActiveEvent(item);
    }, 200);
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/events')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then((data) => {
        setEventsData(data.today);
      })
      .catch((error) => {
        console.error('Error:', error);
        if (!isToastDisplayedRef.current) {
          toast.error('Data temporarily unavailable 😔 We promise to be back soon!', {
            position: 'top-center',
            autoClose: 50000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          isToastDisplayedRef.current = true;
        }
      });
  }, []);


  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.log('Geolocation is not supported');
    }
  }, []);

  const renderMarkers = () => {
    return eventsData.map((item, i) => {

      if (isNaN(item.longitude) || isNaN(item.latitude)) {
        return null; 
      }
      
      let index = categoryValue.indexOf(item.activity_type);
      let colorClass;
      if (index < 3) {
        colorClass = 'color-crimson';
      } else if (index < 2) {
        colorClass = 'color-purple';
      } else if (index < 4) {
        colorClass = 'color-blue';
      } else if (index < 6) {
        colorClass = 'color-green';
      } else if (index < 8) {
        colorClass = 'color-gold';
      } else if (index < 10) {
        colorClass = 'color-teal';
      } else if (index < 12) {
        colorClass = 'color-pink';
      } else if (index < 14) {
        colorClass = 'color-orange';
      } else {
        colorClass = 'color-gray';
      }

      // Determine if the marker should be active
      const isActive = selectedCategory === null || selectedCategory === item.activity_type;
      let className = `custom-marker ${colorClass} marker-fade ${isActive ? 'active' : 'inactive'}`;

      return (
        <Marker
          key={i}
          longitude={item.longitude}
          latitude={item.latitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onMarkerClick(item);
          }}
        >
          <div className={className}>
            <img src={`./icons/png/fahdksara_${item.activity_type}.png`} height={32} alt="" />
          </div>
        </Marker>
      );
    });
  };

  const getUniqueCategories = () => {
    let categories = eventsData && Array.isArray(eventsData) && eventsData.map((dt) => dt.activity_type);

    return [...new Set(categories)];
  };

  const categoryValue = useMemo(() => {
    let categories = getUniqueCategories();
    categories.sort();
    return categories;
  }, [eventsData]);

  const currentDate = new Date().toLocaleString();

  return (
    <>
      <div className="intro-container">
        <div className="intro-text">
          <div className="icon-container">
            <Link to="/">
              <FontAwesomeIcon icon={faSignOutAlt} onClick={handleLogout} />
            </Link>
            <Clock />
          </div>
        </div>
      </div>
      <div className="legend-container">
  <div className={`legend-item d-flex ${selectedCategory === null ? 'selected-category' : ''}`} onClick={() => setSelectedCategory(null)}>
    <div style={{ marginLeft: '37px' }} className="legend-item-text" onClick={() => setSelectedCategory(null)}>
      View All
    </div>
    <br/>
    <br />
  </div>
  <div className="legend-list">
    {categoryValue.map((category, i) => (
      <div
        className={`legend-item d-flex ${selectedCategory === category ? 'selected-category' : ''}`}
        key={i}
        onClick={() => setSelectedCategory(category)}
      >
        <img src={`./icons/png/fahdksara_${category}.png`} alt="" height={22} />
        <div>{category}</div>
      </div>
    ))}
  </div>
</div>




      <Map
        initialViewState={mapViewport}
        className="map-container"
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={import.meta.env.VITE_APP_MAPBOX_TOKEN}
        onViewportChange={setMapViewport}
      >
        {renderMarkers()}

        // Inside the Popup component
        // Inside the Popup component
        {activeEvent && (
  <Popup
    latitude={activeEvent.latitude}
    longitude={activeEvent.longitude}
    anchor="bottom"
    onClose={() => setActiveEvent(null)}
    focusAfterOpen={false}
    className="custom-popup"
  >
    <div className="popup-content">
    <div className="popup-title">
        <a 
            href={`https://www.google.com/search?q=${encodeURIComponent(`${activeEvent.name} ${activeEvent.address}`)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: "inherit", textDecoration: "none" }}
        >
            {activeEvent.name}
        </a>
        </div>
      <br></br>
      <div className="popup-body">
        <div className="">
          <div className="popup-item d-flex">
            <span>
              <FontAwesomeIcon icon={faCalendar} color="#444" />
            </span>
            <div>{activeEvent.date}</div>
          </div>
          <div className="popup-item d-flex">
            <span>
              <FontAwesomeIcon icon={faMapMarker} color="#444" />
            </span>
            <div>{activeEvent.address}</div>
          </div>
        </div>

        <p>{activeEvent.description}</p>
      </div>
      {/* Add this part */}
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${activeEvent.latitude},${activeEvent.longitude}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{ fontSize: "0.8rem", padding: "5px 10px" }} // Adjust button size and font size here
        >
        <FontAwesomeIcon icon={faDirections} style={{ marginRight: "5px" }} /> {/* Adds space between icon and text */}
        Open in Google Maps
        </a>
    </div>
  </Popup>
)}

        {currentLocation && (
        <Marker longitude={currentLocation.longitude} latitude={currentLocation.latitude}>
            <div className="current-location-marker" onClick={() => setShowCurrentLocationPopup(true)}>
            <FontAwesomeIcon icon={faLocationArrow} color="#FFF" />
            </div>
        </Marker>
        )}
        {showCurrentLocationPopup && (
            <Popup
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                anchor="bottom"
                onClose={() => setShowCurrentLocationPopup(false)}
                className="custom-popup"
            >
                <div className="popup-content">
                <div className="popup-title">Current Location</div>
                </div>
            </Popup>
            )}
      </Map>
      

    </>
  );
}

export default MapComponent;
