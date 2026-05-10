import { useEffect, useCallback, useRef } from 'react';
import { getRadar, updateLocation } from '../services/api';
import { useRadarStore } from '../store/radarStore';
import { isDummy, DEMO_CENTER_LAT, DEMO_CENTER_LNG } from '../services/dummyData';

const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 };

export function useRadar() {
  const { radius, setUsers, setPosition, markFetched } = useRadarStore();
  const posRef = useRef({ lat: null, lng: null });
  const watchIdRef = useRef(null);

  const fetchNearby = useCallback(async (lat, lng) => {
    try {
      const users = await getRadar(lat, lng, radius);
      setUsers(users || []);
      markFetched();
    } catch (err) {
      console.warn('Radar fetch error', err);
    }
  }, [radius, setUsers, markFetched]);

  const handlePosition = useCallback(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      posRef.current = { lat, lng };
      if (!isDummy()) setPosition(lat, lng);
      updateLocation(lat, lng).catch(() => {});
      fetchNearby(lat, lng);
    },
    [setPosition, fetchNearby],
  );

  useEffect(() => {
    if (isDummy()) {
      // Pin the demo view to New Delhi — never use live geolocation
      setPosition(DEMO_CENTER_LAT, DEMO_CENTER_LNG);
      fetchNearby(DEMO_CENTER_LAT, DEMO_CENTER_LNG);
      return;
    }
    if (!navigator.geolocation) {
      fetchNearby(0, 0);
      return;
    }
    navigator.geolocation.getCurrentPosition(handlePosition, () => fetchNearby(0, 0), GEO_OPTIONS);
    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, () => {}, GEO_OPTIONS);
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [handlePosition, fetchNearby, setPosition]);

  // Re-fetch when radius changes
  useEffect(() => {
    if (isDummy()) {
      fetchNearby(DEMO_CENTER_LAT, DEMO_CENTER_LNG);
      return;
    }
    const { lat, lng } = posRef.current;
    if (lat != null) fetchNearby(lat, lng);
  }, [radius, fetchNearby]);

  return { fetchNearby };
}
