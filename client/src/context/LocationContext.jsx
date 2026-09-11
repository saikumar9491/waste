import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const LocationContext = createContext();

const LOCAL_STORAGE_COORDS_KEY = 'wastewise_user_coords';
const LOCAL_STORAGE_ADDR_KEY = 'wastewise_user_address';

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COORDS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [address, setAddress] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_ADDR_KEY) || '';
    } catch (e) {
      return '';
    }
  });

  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [error, setError] = useState(null);

  // Reverse geocode coordinates to human-readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addr = data.address || {};
          const parts = [
            addr.road || addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.county || addr.state_district,
            addr.state
          ].filter(Boolean);

          const formatted = parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(', ');
          setAddress(formatted);
          localStorage.setItem(LOCAL_STORAGE_ADDR_KEY, formatted);
          return formatted;
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    const fallback = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setAddress(fallback);
    localStorage.setItem(LOCAL_STORAGE_ADDR_KEY, fallback);
    return fallback;
  };

  // Request browser location (compatible with Chrome, Edge, Firefox, Safari)
  const requestLocation = useCallback((interactive = false) => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unsupported');
      setError('Geolocation is not supported by your browser');
      if (interactive) {
        toast.error('Geolocation is not supported by your browser');
      }
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const acc = Math.round(position.coords.accuracy || 0);

        const newCoords = { lat, lng };
        setCoords(newCoords);
        setAccuracy(acc);
        setPermissionStatus('granted');
        setLoading(false);
        setError(null);

        localStorage.setItem(LOCAL_STORAGE_COORDS_KEY, JSON.stringify(newCoords));

        const resolvedAddress = await reverseGeocode(lat, lng);
        if (interactive) {
          toast.success(`📍 Location locked: ${resolvedAddress}`);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setPermissionStatus('denied');
          setError('Location access denied in browser settings.');
          if (interactive) {
            toast.error(
              'Location permission was denied in Chrome. Click the tune/lock icon next to the URL to allow location.',
              { duration: 5000 }
            );
          }
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setPermissionStatus('prompt');
          setError('Location position unavailable.');
          if (interactive) {
            toast.error('Unable to retrieve your location. Please check your device GPS.');
          }
        } else if (err.code === 3) {
          // TIMEOUT
          setPermissionStatus('prompt');
          setError('Location request timed out.');
          if (interactive) {
            toast.error('Location request timed out.');
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Check and listen to Permissions API if supported by Chrome
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((perm) => {
          setPermissionStatus(perm.state);
          perm.onchange = () => {
            setPermissionStatus(perm.state);
            if (perm.state === 'granted') {
              requestLocation(false);
            }
          };
        })
        .catch(() => {});
    }

    // Auto-prompt/request location when the website loads
    requestLocation(false);
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        coords,
        setCoords: (newCoords) => {
          setCoords(newCoords);
          if (newCoords) {
            localStorage.setItem(LOCAL_STORAGE_COORDS_KEY, JSON.stringify(newCoords));
            reverseGeocode(newCoords.lat, newCoords.lng);
          }
        },
        address,
        setAddress,
        accuracy,
        loading,
        permissionStatus,
        error,
        requestLocation,
        reverseGeocode
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
