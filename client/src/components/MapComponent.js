// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const timer = setTimeout(() => {
      try {
        const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
        mapRef.current = map;

        // 타일 레이어 추가
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // 지도 완전히 로드 후 위치 찾기
        map.whenReady(() => {
          map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
        });

        // 위치 찾기 성공
        map.on('locationfound', function (e) {
          console.log('Location found:', e.latlng);
          onLocationChange(e.latlng);

          // 기존 현재 위치 마커 제거
          if (currentLocationMarkerRef.current) {
            map.removeLayer(currentLocationMarkerRef.current);
          }

          // 새 현재 위치 마커 추가 (기본 아이콘)
          currentLocationMarkerRef.current = L.marker(e.latlng)
            .addTo(map)
            .bindPopup('내 현재 위치')
            .openPopup();
        });

        // 위치 찾기 실패
        map.on('locationerror', function (e) {
          console.error('Location error:', e);
          alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
        });

      } catch (error) {
        console.error('Map initialization error:', error);
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      currentLocationMarkerRef.current = null;
      savedMarkersRef.current = [];
    };
  }, [onLocationChange]);

  // 저장된 주차 위치 마커 추가/업데이트
  useEffect(() => {
    if (!mapRef.current || !markers) return;

    console.log('Updating markers:', markers.length);

    markers.forEach((markerData) => {
      const alreadyAdded = savedMarkersRef.current.find(m => m.id === markerData.id);
      if (alreadyAdded) return;

      console.log('Adding new marker:', markerData.id);

      const popupContent = `
        <div style="text-align: center; min-width: 220px;">
          <b style="font-size: 16px;">🚗 주차 위치</b><br/>
          ${markerData.imageBase64 ? `
            <img 
              src="${markerData.imageBase64}"
              style="
                width: 200px; 
                height: 150px;
                object-fit: cover;
                margin: 10px 0;
                border-radius: 8px; 
                cursor: pointer;
                transition: transform 0.2s;
              "
              onclick="window.openImageFromApp && window.openImageFromApp('${markerData.imageBase64}')"
              onmouseover="this.style.transform='scale(1.05)'"
              onmouseout="this.style.transform='scale(1)'"
            /><br/>
          ` : ''}
          <small style="color: #666; font-size: 12px;">
            ${new Date(markerData.timestamp).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small><br/>
          <a 
            href="https://www.google.com/maps?q=${markerData.lat},${markerData.lng}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              margin-top: 8px;
              padding: 8px 16px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-size: 14px;
              font-weight: bold;
            "
          >
            구글맵으로 열기 →
          </a>
        </div>
      `;

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