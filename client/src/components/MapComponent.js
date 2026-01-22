// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ onLocationChange }) {
  const mapRef = useRef(null);
  // No need for local currentLatLng state if it's passed via prop
  // const [currentLatLng, setCurrentLatLng] = useState(null);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map').setView([37.5665, 126.9780], 13); // Default view
      mapRef.current = map; // Store map instance in ref

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });

      map.on('locationfound', function (e) {
        // setCurrentLatLng(e.latlng); // Update local state
        onLocationChange(e.latlng); // Pass location to parent

        // Clear existing markers if any
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add a marker for the current location
        L.marker(e.latlng)
          .addTo(map)
          .bindPopup('내 현재 위치')
          .openPopup();

        // L.circle(e.latlng, e.accuracy).addTo(map); // Optional: accuracy circle
      });

      map.on('locationerror', function (e) {
        alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
        console.error("Location error:", e);
      });
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange]); // Dependency array: re-run if onLocationChange changes

  return (
    <div id="map" style={{ width: '100%', height: 'calc(100vh - 60px)', borderTop: '3px solid #2c3e50' }}>
      {/* The map will be rendered here by Leaflet */}
    </div>
  );
}

export default MapComponent;