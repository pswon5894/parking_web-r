// src/components/MapComponent.js
import React, { useEffect, useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { createPopupContent } from '../utils/popupUtils';

import { useMapInitialization} from '../hooks/useMapInitialization';
import { useMapLocation } from '../hooks/useMapLocation';
import { useFetchLastLocation } from '../hooks/useFetchLastLocation';


// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ onLocationChange, markers = [], onMarkerImageClick }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null); // 현재 위치 마커
  const savedMarkersRef = useRef([]); // 저장된 주차 위치 마커들

  const { user, serverUrl } = useAuth(); //  loading 상태 가져오기
  // const [, setCurrentLatLng] = useState(null);

  // 현재 위치 갱신
  // useMapLocation 훅 사용!
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

  //지도 초기화 훅 사용
  useMapInitialization(
    mapContainerRef,
    mapRef,
    handleLocationFound,  //  훅에서 받아온 함수!
    handleLocationError   //  훅에서 받아온 함수!
  );

  // 마지막 주차 위치 가져오기
  useFetchLastLocation(mapRef, savedMarkersRef, user, serverUrl);

  // 저장된 주차 위치 마커 추가/업데이트
  useEffect(() => {
    if (!mapRef.current || !markers) return;

    console.log('Updating markers:', markers.length);

    markers.forEach((markerData) => {
      const alreadyAdded = savedMarkersRef.current.find(m => m.id === markerData.id);
      if (alreadyAdded) return;

      console.log('Adding new marker:', markerData.id);

      const popupContent = createPopupContent(
        markerData.lat, 
        markerData.lng, 
        markerData.timestamp, 
        markerData.imageBase64);

      // 기본 Leaflet 마커 사용
      const marker = L.marker([markerData.lat, markerData.lng]).addTo(mapRef.current);

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        marker.openPopup();
      });

      savedMarkersRef.current.push({
        id: markerData.id,
        marker: marker
      });
    });
  }, [markers, onMarkerImageClick]);

  // 지도 크기 재조정
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <button className="location-refresh"
      onClick={refreshLocation}
    >
      위치 갱신
    </button>

    {/* 주차 위치 저장 버튼 */}
  </>
  );
}

export default MapComponent;