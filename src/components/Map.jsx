import { useState, useMemo, useEffect, useRef } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faCalendar, faDirections, faMapMarker, faHome, faSignOutAlt, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import Clock from './Clock';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Map.css'; 

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
  const [isLegendVisible, setLegendVisible] = useState(window.innerWidth > 600);
  const [isButtonPressed, setButtonPressed] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setLegendVisible(window.innerWidth > 600);
    }

    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({ returnTo: `${window.location.origin}` });
  };

  const { user } = useAuth0();

  useEffect(() => {
    if (user && user.email_verified && !isToastDisplayedRef.current) {
      let displayName = user.name;
      if (user.name) {
        const nameParts = user.name.split(' ');
        if (nameParts.length > 0) {
          const firstName = nameParts[0];
          displayName = firstName;
        }
      } else if (user.userName) {
        displayName = user.userName;
      }

      toast.success(`Welcome, ${displayName}!`);
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
    fetch('https://costless.herokuapp.com/events')
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
          toast.error('Data is temporarily unavailable 😔 We promise to be back soon!', {
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

  const getFirstSentence = (description) => {
    const sentences = description.split(". ");
    return sentences[0] + ".";
  };

  const redirectToGoogleMaps = () => {
    const { name, address } = activeEvent;
    const encodedName = encodeURIComponent(name);
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedName}+${encodedAddress}`;
    window.open(url, '_blank');
  };

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

      <div className="legend-wrapper">
        <button
          className={`legend-toggle btn ${isButtonPressed ? 'btn-pressed' : 'btn-primary'}`}
          onClick={() => {
            setLegendVisible(!isLegendVisible);
            setButtonPressed(!isButtonPressed);
          }}
        >
          <FontAwesomeIcon icon={faFilter} />
        </button>

        {isLegendVisible && (
          <div className="legend-container">
            <div className={`legend-item d-flex ${selectedCategory === null ? 'selected-category' : ''}`} onClick={() => setSelectedCategory(null)}>
              <div style={{ marginLeft: '37px' }} className="legend-item-text" onClick={() => setSelectedCategory(null)}>
                View All
              </div>
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
        )}
      </div>

      <Map
        initialViewState={mapViewport}
        className="map-container"
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={import.meta.env.VITE_APP_MAPBOX_TOKEN}
        onViewportChange={setMapViewport}
      >
        {renderMarkers()}
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
                    <div>{activeEvent.date.replace(/&commat;/g, '@').replace(/&comma;/g, '@').replace(/@commat/g, '@')}</div>
                  </div>
                  <div className="popup-item d-flex">
                    <span>
                      <FontAwesomeIcon icon={faMapMarker} color="#444" />
                    </span>
                    <div>{activeEvent.address}</div>
                  </div>
                  <br />
                </div>
                <p>{getFirstSentence(activeEvent.description)}</p> {/* Only display the first sentence */}
              </div>
              {/* Modify this part */}
              <button
                className="btn btn-primary"
                onClick={redirectToGoogleMaps}
                style={{ fontSize: "0.8rem", padding: "5px 10px" }} // Adjust button size and font size here
              >
                <FontAwesomeIcon icon={faDirections} style={{ marginRight: "5px" }} /> {/* Adds space between icon and text */}
                Open in Google Maps
              </button>
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