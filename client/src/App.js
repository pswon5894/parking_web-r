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