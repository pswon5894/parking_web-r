# `popupContent`가 지도에 표시되지 않는 문제 해결

현재 `App.js`에서 생성된 `popupContent`는 지도 컴포넌트로 전달되지 않아, "저장" 버튼을 눌러도 지도에 아무런 변화가 없습니다. 이 문제를 해결하기 위해 `App.js`와 `MapComponent.js`를 수정하여, 저장된 주차 위치가 지도에 새로운 마커와 팝업으로 표시되도록 변경합니다.

## 문제 원인

`App.js`의 `handleSaveLocation` 함수는 `popupContent`라는 변수를 만들지만, 이 데이터를 `MapComponent`로 전달하여 지도에 표시하는 로직이 누락되어 있습니다.

## 해결 방법

1.  **`App.js`**: "저장된 주차 위치"에 대한 정보를 상태(state)로 관리하고, 이 상태를 `MapComponent`에 props로 전달합니다.
2.  **`MapComponent.js`**: `App.js`로부터 받은 props를 사용하여, 지도 위에 새로운 마커와 정보 팝업을 생성합니다.

---

## 1. `client/src/App.js` 파일 수정

`parkingMarker`라는 새로운 상태를 추가하여 주차 위치 정보를 관리하고, `handleSaveLocation` 함수가 이 상태를 업데이트하도록 변경합니다.

**아래 코드로 `client/src/App.js` 파일 전체를 교체하세요.**

```javascript
// client/src/App.js
import React, { useState, useCallback } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import SaveButton from './components/SaveButton';
import ImageModal from './components/ImageModal';
import { readImage } from './utils/imageUtils';
import Login from './components/Login';

function App() {
  const [currentLatLng, setCurrentLatLng] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  // 새로 추가된 상태: 주차 마커 정보를 저장합니다.
  const [parkingMarker, setParkingMarker] = useState(null);

  const handleLocationChange = useCallback((latlng) => {
    setCurrentLatLng(latlng);
  }, []);

  const openImageModal = useCallback((src) => {
    setModalImageSrc(src);
    setImageModalOpen(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setModalImageSrc('');
    setImageModalOpen(false);
  }, []);

  const handleSaveLocation = async (file) => {
    if (!currentLatLng) {
      alert('현재 위치를 확인 중입니다. 잠시만 기다려주세요');
      return;
    }

    const imageBase64 = file ? await readImage(file) : null;
    const { lat, lng } = currentLatLng;

    // 팝업 내용을 생성합니다.
    const popupContent = `
      <b>⭐ 내 주차 위치</b><br/>
      ${imageBase64 ? `<img src="${imageBase64}"
        style="width:200px; margin-top:5px; border-radius:8px; cursor:pointer;"
        onclick="window.openImageFromApp('${imageBase64}')"
      /><br/>` : ''}
      <a href="https://www.google.com/maps?q=${lat},${lng}"
         target="_blank">구글맵으로 열기</a>`;

    // React 방식으로 팝업 내 이미지 클릭 이벤트를 처리하기 위해 전역 함수를 노출합니다.
    window.openImageFromApp = openImageModal;

    // parkingMarker 상태를 업데이트하여 MapComponent에 정보를 전달합니다.
    setParkingMarker({ lat, lng, popupContent });

    // 주소 정보 가져오기 및 클립보드 복사 로직은 그대로 유지합니다.
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const address = data.display_name || '주소 정보 없음';
        alert(`주차 위치 저장됨\n\n주소:\n${address}`);
      })
      .catch(error => console.error("Error fetching address:", error));

    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    navigator.clipboard.writeText(googleMapsUrl).then(() => {
      console.log('주차 위치가 구글 맵 링크로 복사되었습니다!', googleMapsUrl);
    }).catch(err => {
      console.error('복사 실패:', err);
    });
  };

  return (
    <div className="App">
      <Login />
      <h2>주차 위치 지도</h2>
      <MapComponent 
        onLocationChange={handleLocationChange} 
        parkingMarker={parkingMarker} // parkingMarker 상태를 prop으로 전달
      />
      <SaveButton onSave={handleSaveLocation} />
      <ImageModal isOpen={imageModalOpen} src={modalImageSrc} onClose={closeImageModal} />
    </div>
  );
}

export default App;
```

---

## 2. `client/src/components/MapComponent.js` 파일 수정

`parkingMarker` prop을 받아서, 해당 위치에 커스텀 아이콘으로 마커를 추가하는 로직을 `useEffect`를 사용하여 구현합니다.

**아래 코드로 `client/src/components/MapComponent.js` 파일 전체를 교체하세요.**

```javascript
// client/src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 아이콘 경로 문제를 해결합니다.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// 주차 위치를 위한 커스텀 아이콘을 정의합니다.
const parkingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapComponent({ onLocationChange, parkingMarker }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const parkingMarkerRef = useRef(null); // 주차 마커를 위한 ref 추가

  // 지도 초기화 Effect
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('locationfound', (e) => {
      onLocationChange(e.latlng);
      if (currentLocationMarkerRef.current) {
        map.removeLayer(currentLocationMarkerRef.current);
      }
      currentLocationMarkerRef.current = L.marker(e.latlng)
        .addTo(map)
        .bindPopup('내 현재 위치');
    });

    map.on('locationerror', (e) => {
      alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
    });

    map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onLocationChange]);

  // 주차 마커를 지도에 추가하는 Effect
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !parkingMarker) return;

    // 기존 주차 마커가 있으면 제거
    if (parkingMarkerRef.current) {
      map.removeLayer(parkingMarkerRef.current);
    }

    // 새로운 주차 마커 추가
    const { lat, lng, popupContent } = parkingMarker;
    const marker = L.marker([lat, lng], { icon: parkingIcon }) // 커스텀 아이콘 사용
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup(); // 팝업을 바로 엽니다.

    parkingMarkerRef.current = marker; // 새 마커를 ref에 저장
    map.setView([lat, lng], 17); // 주차 위치로 지도 시점 이동

  }, [parkingMarker]); // parkingMarker prop이 변경될 때마다 실행

  return (
    <div 
      ref={mapContainerRef}
      style={{ 
        width: '100%', 
        height: 'calc(100vh - 120px)' // App.js 레이아웃에 맞게 높이 조절
      }}
    />
  );
}

export default MapComponent;
```

---

## 주요 변경 사항 요약

### `App.js`
*   `parkingMarker` 상태를 추가하여 `lat`, `lng`, `popupContent`를 객체로 저장합니다.
*   `handleSaveLocation` 함수가 `popupContent`를 생성한 후, 지역 변수로 두지 않고 `setParkingMarker`를 통해 상태를 업데이트합니다.
*   `<MapComponent>`에 `parkingMarker` 상태를 prop으로 전달합니다.

### `MapComponent.js`
*   props로 `parkingMarker`를 받습니다.
*   `parkingMarker`가 변경될 때마다 실행되는 `useEffect` 훅을 추가했습니다.
*   이 `useEffect` 안에서:
    *   기존에 있던 주차 마커를 찾아 제거합니다.
    *   `parkingMarker` 정보와 **빨간색 커스텀 아이콘**을 사용하여 새로운 마커를 생성합니다.
    *   마커에 팝업을 연결하고, 즉시 열어줍니다.
    *   지도 뷰를 저장된 주차 위치로 이동시켜 사용자가 쉽게 위치를 확인하도록 합니다.

이제 "저장" 버튼을 누르면, `App.js`가 주차 위치 정보를 업데이트하고, `MapComponent`는 그 정보를 받아 지도에 즉시 빨간색 마커와 상세 정보 팝업을 표시할 것입니다.
