// src/hooks/useMapMarkers.js
import { useEffect, useCallback } from 'react';
import L from 'leaflet';
import { createPopupContent } from '../utils/popupUtils';

/**
 * 지도의 마커들을 관리합니다.
 * @param {Object} mapRef - Leaflet 지도 참조
 * @param {Object} savedMarkersRef - 저장된 마커들의 참조
 * @param {Array} markers - 마커 데이터 배열
 * @param {Function} onMarkerImageClick - 마커 이미지 클릭 핸들러
 */
export const useMapMarkers = (mapRef, savedMarkersRef, markers, onMarkerImageClick) => {
  
  // 모든 저장된 마커 제거
  const clearSavedMarkers = useCallback(() => {
    if (!mapRef.current) return;
    
    savedMarkersRef.current.forEach(m => {
      mapRef.current.removeLayer(m.marker);
    });
    savedMarkersRef.current = [];
  }, [mapRef, savedMarkersRef]);

  // 마커 추가 및 업데이트
  useEffect(() => {
    if (!mapRef.current || !markers) return;

    console.log('Updating markers:', markers.length);

    markers.forEach((markerData) => {
      // 중복 방지
      const alreadyAdded = savedMarkersRef.current.find(m => m.id === markerData.id);
      if (alreadyAdded) return;

      console.log('Adding new marker:', markerData.id);

      const popupContent = createPopupContent(
        markerData.lat, 
        markerData.lng, 
        markerData.timestamp, 
        markerData.imageBase64
      );

      // Leaflet 마커 생성
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
  }, [markers, mapRef, savedMarkersRef, onMarkerImageClick]);

  return {
    clearSavedMarkers
  };
};