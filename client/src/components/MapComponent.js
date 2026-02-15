// src/components/MapComponent.js
import React, { useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { useMapInitialization, useMapResize } from '../hooks/useMapInitialization';
import { useMapLocation } from '../hooks/useMapLocation';
import { useMapMarkers } from '../hooks/useMapMarkers';
import { useFetchLastLocation } from '../hooks/useFetchLastLocation';

// Leaflet 기본 아이콘 설정 수정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ onLocationChange, markers = [], onMarkerImageClick }) {
  // Refs
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const savedMarkersRef = useRef([]);

  // Context
  const { user, serverUrl } = useAuth();

  // 현재 위치 관리
  const {
    refreshLocation,
    handleLocationFound,
    handleLocationError
  } = useMapLocation(
    mapRef,
    currentLocationMarkerRef,
    onLocationChange,
    user,
    serverUrl
  );

  // 지도 초기화
  useMapInitialization(
    mapContainerRef,
    mapRef,
    handleLocationFound,
    handleLocationError
  );

  // 지도 리사이즈 처리
  useMapResize(mapRef);

  // 마커 관리
  const { clearSavedMarkers } = useMapMarkers(
    mapRef,
    savedMarkersRef,
    markers,
    onMarkerImageClick
  );

  // 마지막 주차 위치 가져오기
  useFetchLastLocation(mapRef, savedMarkersRef, user, serverUrl);

  // 위치 갱신 버튼 클릭 핸들러
  const handleRefreshClick = () => {
    clearSavedMarkers();
    
    // 현재 위치 마커 제거
    if (currentLocationMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(currentLocationMarkerRef.current);
      currentLocationMarkerRef.current = null;
    }

    refreshLocation();
  };

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: 'calc(100vh - 70px)',
          borderTop: '3px solid #2c3e50',
        }}
      />

      {/* 위치 갱신 버튼 */}
      <button 
        className="location-refresh"
        onClick={handleRefreshClick}
      >
        위치 갱신
      </button>
    </>
  );
}

export default MapComponent;