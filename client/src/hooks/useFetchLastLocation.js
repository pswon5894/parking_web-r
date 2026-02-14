// src/hooks/useFetchLastLocation.js
import { useEffect } from 'react';
import L from 'leaflet';
import { createPopupContent } from '../utils/popupUtils';

/**
 * 서버에서 마지막 주차 위치를 가져와 지도에 표시합니다.
 * @param {Object} mapRef - Leaflet 지도 참조
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

                const { lat, lng, timestamp ,imageBase64 } = result.data;

                if (typeof lat !== 'number' || typeof lng !== 'number') return;

                // // 이미 같은 id가 추가되어 있다면 마커 중복 방지
                const alreadyAdded = savedMarkersRef.current.find(m => m.id === 'last');
                // if (alreadyAdded) return;
                if (alreadyAdded) {
                    // 기존 마커 제거
                    mapRef.current.removeLayer(alreadyAdded.marker);

                    // 배열에서도 제거
                    savedMarkersRef.current = savedMarkersRef.current.filter(
                        m => m.id !== 'last'
                    );
                }

                const marker = L.marker([lat, lng]).addTo(mapRef.current);

                const popupContent = createPopupContent(lat, lng, timestamp, imageBase64, '🚗 저장된 주차 위치');

                marker.bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'custom-popup',
                }).openPopup();;

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
    }, [mapRef, savedMarkersRef, user?.id, serverUrl]);
};