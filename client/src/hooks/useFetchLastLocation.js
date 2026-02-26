// src/hooks/useFetchLastLocation.js
import { useEffect } from 'react';
import L from 'leaflet';
import { createPopupContent } from '../utils/popupUtils';   //말풍선 팝업

/**
 * 서버에서 마지막 주차 위치를 가져와 지도에 표시합니다.
 * @param {Object} mapRef - - Leaflet 지도 객체를 참조하기 위한 ref입니다
 * @param {Object} savedMarkersRef - 저장된 마커들의 참조
 * @param {Object} user - 사용자 정보
 * @param {string} serverUrl - 서버 URL
 */
export const useFetchLastLocation = (mapRef, savedMarkersRef, user, serverUrl) => {
  useEffect(() => {
    const fetchLastLocation = async () => {
      if (!mapRef.current || !user?.id) return;

      try {
        const res = await fetch(`${serverUrl}/api/auth/last-parking-location/${user.id}`);
        if (!res.ok) return;

        const result = await res.json();
        console.log('last parking location:', result);

        if (!result.success || !result.data) return;

        const { lat, lng, timestamp, imageBase64 } = result.data;

        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const marker = L.marker([lat, lng]).addTo(mapRef.current);

        const popupContent = createPopupContent(lat, lng, timestamp, imageBase64, '🚗 저장된 주차 위치');

        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: 'custom-popup',
        }).openPopup();

        savedMarkersRef.current.push({
          id: 'last',
          marker,
        });

        mapRef.current.setView([lat, lng], 16);
        
      } catch (err) {
        console.error('마지막 주차 위치 불러오기 실패', err);
      }
    };

    fetchLastLocation();

    // 기존 'last' id 마커 제거
    //존재하는 마커 인덱스 = savedMarkersRef.current 배열 안에서 id가 'last'인 마커를 찾아서
    const existingMarkerIndex = savedMarkersRef.current.findIndex(m => m.id === 'last');
    if (existingMarkerIndex !== -1) {         // 'last'인 id 마커 존재하면
      //해당 인덱스에 있는 마커 객체(marker)를 지도에서 제거
      savedMarkersRef.current[existingMarkerIndex].marker.remove();
      //배열에서 그 마커 데이터 삭제
      savedMarkersRef.current.splice(existingMarkerIndex, 1);
    }

  }, [mapRef, savedMarkersRef, user, serverUrl]);
};