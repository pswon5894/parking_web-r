// src/hooks/useMapInitialization.js
import { useEffect } from 'react';
import L from 'leaflet';

/**
 * Leaflet 지도를 초기화하고 기본 설정을 적용합니다.
 * @param {Object} mapContainerRef - 지도 컨테이너 DOM 참조
 * @param {Object} mapRef - Leaflet 지도 참조
 * @param {Function} onLocationFound - 위치 찾기 성공 핸들러
 * @param {Function} onLocationError - 위치 찾기 실패 핸들러
 */
export const useMapInitialization = (mapContainerRef, mapRef, onLocationFound, onLocationError) => {
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // 이미 초기화됨

    // 지도 생성
    const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
    mapRef.current = map;

    // 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // 이벤트 리스너 등록
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    // cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapContainerRef, mapRef, onLocationFound, onLocationError]);
};

/**
 * 윈도우 리사이즈 시 지도 크기를 재조정합니다.
 * @param {Object} mapRef - Leaflet 지도 참조
 */
export const useMapResize = (mapRef) => {
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapRef]);
};