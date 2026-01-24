// src/components/MapComponent.js
import React, { useEffect, useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ onLocationChange }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null); // DOM 참조 추가
  const markerRef = useRef(null);

  useEffect(() => {
    // DOM 요소가 존재하는지 확인
    if (!mapContainerRef.current) return;

    // 이미 지도가 초기화되었다면 리턴
    if (mapRef.current) return;

    // 약간의 지연을 두고 지도 초기화 (DOM이 완전히 준비될 때까지)
    const timer = setTimeout(() => {
      try {
        const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // 지도가 완전히 로드된 후 위치 찾기
        map.whenReady(() => {
          map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
        });

        map.on('locationfound', function (e) {
          onLocationChange(e.latlng);

          // 기존 마커 제거
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // 새 마커 추가
          markerRef.current = L.marker(e.latlng)
            .addTo(map)
            .bindPopup('내 현재 위치')
            .openPopup();
        });

        map.on('locationerror', function (e) {
          alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
          console.error("Location error:", e);
        });

      } catch (error) {
        console.error("Map initialization error:", error);
      }
    }, 100); // 100ms 지연

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [onLocationChange]);

  // 지도 크기 재조정 (윈도우 리사이즈 시)
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
    <div 
      ref={mapContainerRef}
      style={{ 
        width: '100%', 
        height: 'calc(100vh - 70px)', 
        borderTop: '3px solid #2c3e50' 
      }}
    />
  );
}

export default MapComponent;