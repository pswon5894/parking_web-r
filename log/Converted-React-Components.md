# Converted React Components from `backup` directory

This document outlines the conversion of original JavaScript and HTML files from the `backup` directory into React functional components.

---

## 1. `src/App.js` (Main Application Component)

This component integrates the overall structure from `index.html` and the core logic from `backup/src/app.js`, orchestrating the `MapComponent`, `SaveButton`, and `ImageModal`.

```javascript
// src/App.js
import React, { useState, useCallback } from 'react';
import './App.css'; // Contains general styles from original style.css and index.html
import MapComponent from './components/MapComponent';
import SaveButton from './components/SaveButton';
import ImageModal from './components/ImageModal';
import { readImage } from './utils/imageUtils';

function App() {
  const [currentLatLng, setCurrentLatLng] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  // Callback to receive current location from MapComponent
  const handleLocationChange = useCallback((latlng) => {
    setCurrentLatLng(latlng);
  }, []);

  // Function to open the image modal
  const openImageModal = useCallback((src) => {
    setModalImageSrc(src);
    setImageModalOpen(true);
  }, []);

  // Function to close the image modal
  const closeImageModal = useCallback(() => {
    setModalImageSrc('');
    setImageModalOpen(false);
  }, []);

  // Handle save button click from SaveButton component
  const handleSaveLocation = async (file) => {
    if (!currentLatLng) {
      alert('현재 위치를 확인 중입니다. 잠시만 기다려주세요');
      return;
    }

    if (!file) {
      alert('주차 사진을 찍거나 선택해주세요.');
      return;
    }

    const imageBase64 = await readImage(file);
    const { lat, lng } = currentLatLng;

    // --- Original app.js logic for creating marker and popup ---
    // Note: In a real React app with Leaflet, you'd likely manage markers
    // through state or a custom hook within MapComponent, passing them
    // as props or using Leaflet's API directly from App.js if needed.
    // For this conversion, we'll simulate the popup logic.

    // Simulate Leaflet marker popup content
    const popupContent = `
      <b> 주차 위치</b><br/>
      <img src="${imageBase64}"
      style="width:200px; margin-top:5px; border-radius:8px; cursor:pointer;"
      onclick="window.openImageFromApp('${imageBase64}')"
      /><br/>
      <a href="https://www.google.com/maps?q=${lat},${lng}"
         target="_blank">구글맵으로 열기</a>`;

    // To make onclick work from string content, we had to expose openImageModal globally.
    // This is generally discouraged in React, and a more idiomatic way would be to
    // render a custom React component inside the Leaflet popup using ReactDOM.createPortal.
    window.openImageFromApp = openImageModal; // Expose for popup HTML click

    // In a full React implementation, you would typically add the marker
    // to the map visually here, for example, by passing lat, lng, imageBase64,
    // popupContent to MapComponent as a prop, and MapComponent would then
    // render the L.marker.

    // Reverse geocoding (as in original app.js)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const address = data.display_name || '주소 정보 없음';
        alert(`주차 위치 저장됨\n\n주소:\n${address}`);
      })
      .catch(error => console.error("Error fetching address:", error));

    // Google Maps URL to clipboard
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    navigator.clipboard.writeText(googleMapsUrl).then(() => {
      alert('주차 위치가 구글 맵 링크로 복사되었습니다!\n' + googleMapsUrl);
      console.log('Saved URL:', googleMapsUrl);
    }).catch(err => {
      console.error('복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    });
  };

  return (
    <div className="App">
      <h2>주차 위치 지도</h2>
      <MapComponent onLocationChange={handleLocationChange} />
      <SaveButton onSave={handleSaveLocation} />
      <ImageModal isOpen={imageModalOpen} src={modalImageSrc} onClose={closeImageModal} />
    </div>
  );
}

export default App;
```

---

## 2. `src/App.css` (Global Styles)

These styles are derived from `backup/style.css` and the inline styles found in `index.html`.

```css
/* src/App.css */
body {
    margin: 0;
    font-family: 'Segoe UI', Arial, sans-serif;
    background-color: #f5f7fa; /* 은은한 배경색 */
    color: #333;
}

h2 {
    margin: 0;
    padding: 15px;
    text-align: center;
    background-color: #2c3e50; /* 진한 네이비 */
    color: #fff;
    font-size: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* The #map ID is used by Leaflet in MapComponent */
#map {
    width: 100%;
    height: calc(100vh - 60px); /* 제목 높이만큼 빼기 */
    border-top: 3px solid #2c3e50;
}
```

---

## 3. `src/components/MapComponent.js` (Map Component)

This component encapsulates the Leaflet map initialization and location tracking logic from `backup/src/components/Map.js`.

```javascript
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
```

---

## 4. `src/components/SaveButton.js` (Save Button Component)

This component provides the "Save Location" button and file input, converted from `backup/src/components/SaveButton.js`.

```javascript
// src/components/SaveButton.js
import React, { useRef } from 'react';

function SaveButton({ onSave }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // onSave will be called with the file from the input
    if (onSave) {
        onSave(fileInputRef.current.files[0]);
    }
  };

  return (
    <div className="save-btn-container" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
      <button
        onClick={handleButtonClick}
        style={{ padding: '10px', cursor: 'pointer', display: 'block', marginBottom: '5px' }}
      >
        주차 위치 복사
      </button>
      <input
        type="file"
        id="photoInput"
        accept="image/*"
        capture="environment"
        style={{ marginTop: '5px' }}
        ref={fileInputRef}
      />
    </div>
  );
}

export default SaveButton;
```

---

<h2>5. `src/components/ImageModal.js` (Image Modal Component)</h2>

This component handles displaying an enlarged image in a modal, converted from `backup/src/components/ImageModal.js`.

```javascript
// src/components/ImageModal.js
import React from 'react';
import ReactDOM from 'react-dom'; // For creating a portal

function ImageModal({ isOpen, src, onClose }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.9)',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt="Enlarged"
        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
      />
    </div>,
    document.body // Append to body
  );
}

export default ImageModal;
```

---

<h2>6. `src/utils/imageUtils.js` (Image Utility)</h2>

This utility function is directly reusable in the React environment.

```javascript
// src/utils/imageUtils.js
export function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

<h2>7. `src/server/server.js` (Backend Server - Not a React Component)</h2>

This `server.js` file is a basic Node.js Express server. It's backend code designed to run separately from the React frontend. It would typically serve static files, handle API requests (e.g., for saving parking locations to a database), or provide other server-side functionalities. To integrate with this React application, the React app would make HTTP requests to the endpoints exposed by this (or a more complete) server.

```javascript
// backup/src/server/server.js
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
```

---

<h2>How to use these components in a React project:</h2>

1.  **Create React App:** If you don't have one, create a new React project: `npx create-react-app parking_web_react` (or use Vite, etc.)
2.  **Install Leaflet:** `npm install leaflet`
3.  **Create directories:** Create `src/components` and `src/utils` directories.
4.  **Copy Files:** 
    *   Copy the content of `src/App.js` above into your project's `src/App.js`.
    *   Copy the content of `src/App.css` above into your project's `src/App.css`.
    *   Copy the content of `src/components/MapComponent.js` above into `src/components/MapComponent.js`.
    *   Copy the content of `src/components/SaveButton.js` above into `src/components/SaveButton.js`.
    *   Copy the content of `src/components/ImageModal.js` above into `src/components/ImageModal.js`.
    *   Copy the content of `src/utils/imageUtils.js` above into `src/utils/imageUtils.js`.
5.  **Modify `src/index.js` (if using Create React App default):** Ensure it renders the `App` component.
    ```javascript
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import './index.css'; // Or your global CSS
    import App from './App';
    import reportWebVitals from './reportWebVitals';

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    reportWebVitals();
    ```
6.  **Run the app:** `npm start`

Remember that the Leaflet marker creation in `App.js` is still using a non-React way for popup content. For a more robust solution, you would typically use a library like `react-leaflet` to manage Leaflet layers and popups in a React-idiomatic way, or render React components directly into Leaflet popups using `ReactDOM.createPortal` for each marker.
