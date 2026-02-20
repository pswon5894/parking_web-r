// src/hooks/useMapLocation.js
import { useCallback, useState } from 'react';
import L from 'leaflet';
import { createPopupContent } from '../utils/popupUtils';

/**
 * 지도에서 현재 위치를 추적하고 업데이트합니다.
 * @param {Object} mapRef - Leaflet 지도 참조
 * @param {Object} currentLocationMarkerRef - 현재 위치 마커 참조
 * @param {Function} onLocationChange - 위치 변경 콜백
 * @param {Object} user - 사용자 정보
 * @param {string} serverUrl - 서버 URL
 */
export const useMapLocation = (mapRef, currentLocationMarkerRef, onLocationChange, user, serverUrl) => {
  const [currentLatLng, setCurrentLatLng] = useState(null);

  // 위치 갱신 함수
  const refreshLocation = useCallback(() => {
    if (!mapRef.current) return;

    mapRef.current.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });
  }, [mapRef]);

  // 위치 찾기 성공 핸들러
  const handleLocationFound = useCallback(async (e) => {
    const { lat, lng } = e.latlng;

    // 서버에 위치 업데이트 기록
    if (user && user.id) {
      try {
        await fetch(`${serverUrl}/api/auth/update-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, location: { lat, lng } })
        });
      } catch (err) {
        console.error('위치 업데이트 실패:', err);
      }
    }

    setCurrentLatLng({ lat, lng });
    onLocationChange?.(e.latlng);   // 함수가 비어있을수도, 옵셔널 체이닝 연산자, - ?. 는 앞의 객체나 함수가 존재할 경우에만 접근하거나 호출


    // 기존 마커 제거
    if (currentLocationMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(currentLocationMarkerRef.current);
    }

    // 새 마커 생성
    const popupContent = createPopupContent(
      lat,
      lng,
      Date.now(),
      null,
      '내 현재 위치'
    );

    currentLocationMarkerRef.current = L.marker([lat, lng])
      .addTo(mapRef.current)
      .bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
      })
      .openPopup();
  }, [mapRef, currentLocationMarkerRef, onLocationChange, user, serverUrl]);

  // 위치 찾기 실패 핸들러
  const handleLocationError = useCallback((e) => {
    console.error(e);
    alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
  }, []);

  return {
    currentLatLng,
    refreshLocation,
    handleLocationFound,
    handleLocationError
  };
};