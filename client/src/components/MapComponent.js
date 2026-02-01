// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuthStore } from '../store/authStore'; //  zustand store 가져오기

import { useAuth } from '../context/AuthContext';

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

  const { loading, user } = useAuth(); //  loading 상태 가져오기
  //  zustand에서 로그인 여부 가져오기
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const refreshLocation = () => {
  if (!isLoggedIn) {
    alert('로그인 후 위치 갱신이 가능합니다.');
    return;
  }

  if (!mapRef.current) return;

  mapRef.current.locate({
    setView: true,
    maxZoom: 16,
    enableHighAccuracy: true,
  });
};


  // // 지도 초기화
  // useEffect(() => {
  //   if (loading) return;
  //   if (!mapContainerRef.current) return;
  //   if (mapRef.current) return;

  //   const timer = setTimeout(() => {
  //     try {
  //       const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
  //       mapRef.current = map;

  //       // 타일 레이어 추가
  //       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //         attribution: '&copy; OpenStreetMap contributors',
  //         maxZoom: 19
  //       }).addTo(map);

  //       //  로그인 여부 확인 후 위치 찾기
  //       map.whenReady(() => {
  //         if (isLoggedIn) {
  //           map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
  //         } else {
  //           alert("로그인 후 위치 찾기가 가능합니다.");
  //         }
  //       });

  //         // 위치 찾기 성공
  //       map.on('locationfound', async (e) => {
  //         const { lat, lng } = e.latlng;

  //         // 서버에 위치 저장
  //         if (user?._id) {
  //           await fetch('/api/users/update-location', {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({ userId: user._id, location: { lat, lng } })
  //           });
  //         }

  //         onLocationChange(e.latlng);

  //         // 기존 현재 위치 마커 제거
  //         if (currentLocationMarkerRef.current) {
  //           map.removeLayer(currentLocationMarkerRef.current);
  //         }

  //         // 새 현재 위치 마커 추가 (기본 아이콘)
  //         currentLocationMarkerRef.current = L.marker(e.latlng)
  //           .addTo(map)
  //           .bindPopup('내 현재 위치')
  //           .openPopup();

  //       //   // 유저의 저장된 위치가 있으면 지도에 마커 찍고 이동
  //       //   if (user?.location && mapRef.current) {
  //       //     const { lat, lng } = user.location;
  //       //     L.marker([lat, lng])
  //       //       .addTo(mapRef.current)
  //       //       .bindPopup('저장된 내 위치')
  //       //       .openPopup();
  //       //     mapRef.current.setView([lat, lng], 15);
  //       //   }
        
  //       });

  //       // 위치 찾기 실패
  //       map.on('locationerror', function (e) {
  //         console.error('Location error:', e);
  //         alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
  //       });

  //     } catch (error) {
  //       console.error('Map initialization error:', error);
  //     }
  //   }, 100);

  //   // Cleanup
  //   return () => {
  //     clearTimeout(timer);
  //     if (mapRef.current) {
  //       mapRef.current.remove();
  //       mapRef.current = null;
  //     }
  //     currentLocationMarkerRef.current = null;
  //     savedMarkersRef.current = [];
  //   };
  // }, [loading, isLoggedIn, onLocationChange]);

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (loading) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
    mapRef.current = map;

    // 타일 레이어
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // 현재 위치 탐색 성공
    map.on('locationfound', async (e) => {
      const { lat, lng } = e.latlng;

      if (user?._id) {
        await fetch('/api/users/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, location: { lat, lng } })
        });
      }

      onLocationChange(e.latlng);

      if (currentLocationMarkerRef.current) {
        map.removeLayer(currentLocationMarkerRef.current);
      }

      currentLocationMarkerRef.current = L.marker([lat, lng])
        .addTo(map)
        .bindPopup('내 현재 위치')
        .openPopup();
    });

    // 위치 탐색 실패
    map.on('locationerror', (e) => {
      console.error(e);
      alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      currentLocationMarkerRef.current = null;
      savedMarkersRef.current = [];
    };
  }, [loading, onLocationChange]);

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

  // return (
  //   <div 
  //     ref={mapContainerRef}
  //     style={{ 
  //       width: '100%', 
  //       height: 'calc(100vh - 70px)', 
  //       borderTop: '3px solid #2c3e50' 
  //     }}
  //   />
  // );
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
      onClick={refreshLocation}
      style={{
        position: 'absolute',
        right: '20px',
        bottom: '30px',
        zIndex: 1000,
        padding: '12px 16px',
        borderRadius: '50px',
        border: 'none',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }}
    >
      위치 갱신
    </button>
  </>
  );

}

export default MapComponent;