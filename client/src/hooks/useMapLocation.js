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
export const useMapLocation = (
  mapRef,                    // 지도 객체 참조
  currentLocationMarkerRef,  // 현재 위치 마커 참조
  onLocationChange,          // 위치 변경 시 호출할 콜백
  user,                      // 사용자 정보
  serverUrl                  // 서버 주소
) => {
  // 훅 내부 코드
  const [currentLatLng, setCurrentLatLng] = useState(null);

    // 위치 갱신 함수
    const refreshLocation = useCallback(() => {  // mapRef가 변경될 때만 새 함수 생성
    if (!mapRef.current) return;
    
    mapRef.current.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });
  }, [mapRef]); // 의존성 배열, 안하면 매번 컴포넌트가 렌더링될 때마다 새로운 함수가 생성됨

  //지도 초기화
    const handleLocationFound = useCallback(
      async (e) => {
        const { lat, lng } = e.latlng;
  
        //서버에 위치 업데이트 기록
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
      onLocationChange(e.latlng);
  
      // 기존 마커 제거
      if (currentLocationMarkerRef.current) {
        mapRef.current.removeLayer(currentLocationMarkerRef.current);
      }
  
      // 새 마커 생성
      const popupContent = createPopupContent(
        lat,
        lng,
        Date.now(),
        null,
        ' 내 현재 위치'
      );
      currentLocationMarkerRef.current = L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(popupContent, {
          maxWidth: 250,
          className: 'custom-popup',
        })
        .openPopup();

      }, [mapRef, currentLocationMarkerRef, onLocationChange, user, serverUrl]
    );

    const handleLocationError = useCallback((e) => {
        console.error(e);
        alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
    }, []);

    //  외부에서 사용할 것들을 반환!
  return {
    currentLatLng,          // 현재 위치 (상태)
    refreshLocation,        // 위치 갱신 함수
    handleLocationFound,    // 위치 찾기 성공 핸들러
    handleLocationError     // 위치 찾기 실패 핸들러
  };
};

    