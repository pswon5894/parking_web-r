// src/App.js
import React, { useState, useCallback } from 'react';
import './App.css';
import {useThemeStore} from "./theme/themeStore";
import ThemeToggle from "./theme/ThemeToggle";

import MapComponent from './components/MapComponent';
// import SaveButton from './components/SaveButton';
import ImageModal from './components/ImageModal';
import { readImage } from './utils/imageUtils';
import Login from './components/Login';

function App() {

  const darkMode = useThemeStore((state) => state.darkMode);

  const [currentLatLng, setCurrentLatLng] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [markers, setMarkers] = useState([]); // ✅ 마커들 저장

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

  // ✅ Handle save button click from SaveButton component
  const handleSaveLocation = async (file) => {
    if (!currentLatLng) {
      alert('현재 위치를 확인 중입니다. 잠시만 기다려주세요');
      return;
    }

    // 이미지 읽기 (파일이 있을 때만)
    const imageBase64 = file ? await readImage(file) : null;
    const { lat, lng } = currentLatLng;

    // ✅ window에 함수 노출 (팝업에서 이미지 클릭 시 사용)
    window.openImageFromApp = openImageModal;

    // ✅ 새 마커 데이터 생성
    const newMarker = {
      id: Date.now(), // 고유 ID
      lat,
      lng,
      imageBase64,
      timestamp: new Date().toISOString()
    };

    // ✅ 마커 배열에 추가
    setMarkers(prevMarkers => [...prevMarkers, newMarker]);

    // 주소 가져오기 및 클립보드 복사
    try {
      // 리버스 지오코딩 (좌표 → 주소)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || '주소 정보 없음';

      // 구글 맵 URL 생성
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      // 클립보드에 복사
      await navigator.clipboard.writeText(googleMapsUrl);

      // 성공 메시지
      alert(
        `주차 위치가 저장되었습니다!\n\n` +
        `주소: ${address}\n\n` +
        `구글 맵 링크가 클립보드에 복사되었습니다.`
      );

      console.log('Saved location:', { lat, lng, address, googleMapsUrl });
    } catch (error) {
      console.error('주소 조회 또는 복사 실패:', error);
      alert('주차 위치는 저장되었으나 주소 조회에 실패했습니다.');
    }
  };

  return (
    <div className={darkMode ? "app dark" : "App"}>
      <ThemeToggle />
      <Login />
      <h2 className="main-h2">주차 위치 지도</h2>
      
      {/* ✅ markers와 openImageModal을 MapComponent에 전달 */}
      <MapComponent 
        onLocationChange={handleLocationChange}
        markers={markers}
        onMarkerImageClick={openImageModal}
      />
      
      {/* <SaveButton onSave={handleSaveLocation} /> */}
      
      <ImageModal 
        isOpen={imageModalOpen} 
        src={modalImageSrc} 
        onClose={closeImageModal} 
      />
    </div>
  );
}

export default App;