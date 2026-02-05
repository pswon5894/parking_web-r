// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';

import SaveButton from './SaveButton';

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

  const [currentLatLng, setCurrentLatLng] = useState(null);

  // const serverUrl = 'https://parkingweb-r-production.up.railway.app'
  
  // // 개발 환경에서는 http://localhost:5000/api, 프로덕션 환경에서는 배포된 서버 주소 사용
  const serverUrl = process.env.NODE_ENV === 'production'
    ? 'https://parkingweb-r-production.up.railway.app'
    : 'http://localhost:5000';

  const refreshLocation = () => {
  // if (!isLoggedIn) {
  //   alert('로그인 후 위치 갱신이 가능합니다.');
  //   return;
  // }

  if (!mapRef.current) return;

  mapRef.current.locate({
    setView: true,
    maxZoom: 16,
    enableHighAccuracy: true,
  });
};

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
    mapRef.current = map;

    const fetchLastLocation = async () => {
    try {
      const res = await fetch(`${serverUrl}/api/auth/last-parking-location/${user.id}`);
      if (!res.ok) return;

      const result = await res.json();
      console.log('last parking location:', result);

      if (!result.success || !result.data) return;

      const { lat, lng, timestamp ,imageBase64 } = result.data;

      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      // 이미 같은 id가 추가되어 있다면 중복 방지
      const alreadyAdded = savedMarkersRef.current.find(m => m.id === 'last');
      if (alreadyAdded) return;

      const marker = L.marker([lat, lng]).addTo(mapRef.current);

      const popupContent = `
        <div style="text-align: center; min-width: 220px;">
          <b style="font-size: 16px;">🚗 저장된 주차 위치</b><br/>
          ${imageBase64 ? `
            <img 
              src="${imageBase64}"
              style="
                width: 200px; 
                height: 150px;
                object-fit: cover;
                margin: 10px 0;
                border-radius: 8px; 
                cursor: pointer;
              "
            /><br/>
          ` : ''}
          <small style="color: #666; font-size: 12px;">
            ${new Date(timestamp).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small><br/>
          <a 
            href="https://www.google.com/maps?q=${lat},${lng}"
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

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
      });

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

    // 타일 레이어
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // 현재 위치 탐색 성공
    map.on('locationfound', async (e) => {
      const { lat, lng } = e.latlng;

      if (user && user.id) {
        await fetch(`${serverUrl}/api/auth/update-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, location: { lat, lng } })
        });
      }

      setCurrentLatLng({ lat, lng });
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
  }, [loading, onLocationChange, user, serverUrl]);

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

  const saveParkingLocation = async () => {
    if (!user || !user.id) {  // 순서 변경
      alert('로그인이 필요합니다.');
      return;
    }

    if (!currentLatLng) {
      alert('저장할 위치가 없습니다.');
      return;
    }

    try {
      const res = await fetch(`${serverUrl}/api/auth/save-parking-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          location: currentLatLng,
        }),
      });

      if (!res.ok) throw new Error();

      alert('주차 위치가 저장되었습니다 🚗');
    } catch (err) {
      alert('주차 위치 저장 실패');
    }
  };

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
    <SaveButton onSave={saveParkingLocation}
    isLoggedIn={!!user}
    />
  </>
  );
}

export default MapComponent;