# React 환경에서 Leaflet 사용 시 발생하는 `_leaflet_pos` 오류 해결 방법

## 문제 상황

React 애플리케이션에서 Leaflet 지도를 사용하려고 할 때, 다음과 같은 `TypeError`가 발생하는 경우가 있습니다.

```
Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')
    at getPosition (DomUtil.js:247:1)
    ...
```

이 오류는 일반적으로 Leaflet이 지도를 렌더링하거나 지도와 상호작용(예: `setView`, `fitBounds`)하려 할 때, 지도 컨테이너 DOM 요소에 접근하지 못해 발생합니다.

## 원인

React의 렌더링 생명주기(lifecycle)와 관련이 있습니다. 이 오류는 **Leaflet 라이브러리가 아직 DOM에 생성되지 않은 요소를 참조하여 지도를 초기화하려고 할 때** 발생합니다.

React는 가상 DOM(Virtual DOM)을 사용하며, 컴포넌트의 JSX 코드가 바로 실제 DOM 요소로 만들어지는 것이 아닙니다. 따라서 컴포넌트가 렌더링되고 실제 DOM에 마운트되기 전에 Leaflet 초기화 코드가 실행되면, Leaflet은 지도를 삽입할 DOM 요소를 찾지 못해 `undefined`에 접근하게 되고 오류가 발생합니다.

## 해결 방법

React의 `useEffect` 와 `useRef` 훅(Hook)을 사용하여 컴포넌트가 실제 DOM에 렌더링된 **후에** Leaflet 지도를 초기화하면 이 문제를 해결할 수 있습니다.

1.  `useRef`를 사용하여 지도가 표시될 DOM 요소를 참조합니다.
2.  `useEffect`를 사용하여 컴포넌트가 처음 마운트되었을 때 한 번만 지도 초기화 코드를 실행합니다.
3.  `useEffect`의 반환(return) 값으로 cleanup 함수를 지정하여, 컴포넌트가 언마운트(unmount)될 때 지도 인스턴스를 정리해 메모리 누수를 방지합니다.

### 코드 예시 (`MapComponent.js`)

다음은 함수형 컴포넌트에서 Leaflet을 올바르게 초기화하는 방법입니다.

```jsx
import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS 파일 import
import L from 'leaflet';

const MapComponent = () => {
  // 1. 지도를 담을 DOM 요소를 참조하기 위해 useRef를 사용합니다.
  const mapContainer = useRef(null);

  // 2. 지도 인스턴스를 저장하기 위해 useRef를 사용합니다. (리렌더링 시에도 유지됨)
  const mapInstance = useRef(null);

  useEffect(() => {
    // 3. 컴포넌트가 마운트된 후에 이 코드가 실행됩니다.
    // 지도가 이미 초기화되었다면 다시 실행하지 않습니다.
    if (mapInstance.current) {
      return;
    }

    // mapContainer.current는 실제 DOM 요소를 가리킵니다.
    if (mapContainer.current) {
      // 4. 지도 인스턴스를 생성하고 mapInstance.current에 저장합니다.
      mapInstance.current = L.map(mapContainer.current, {
        center: [37.5665, 126.9780], // 초기 위치 (예: 서울)
        zoom: 13,
      });

      // 타일 레이어를 추가합니다.
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);
    }

    // 5. 컴포넌트가 언마운트될 때 실행될 cleanup 함수입니다.
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // 의존성 배열을 빈 값으로 설정하여 마운트 시 한 번만 실행되도록 합니다.

  return (
    // ref 속성을 통해 위에서 생성한 mapContainer ref와 이 div를 연결합니다.
    <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />
  );
};

export default MapComponent;
```

### 핵심 요약

-   **`useRef`**: DOM 요소에 대한 참조를 생성합니다.
-   **`useEffect(..., [])`**: 컴포넌트가 DOM에 마운트된 후 코드를 실행하도록 보장합니다. 빈 의존성 배열(`[]`)은 이 로직이 최초 렌더링 시에 **한 번만** 실행되도록 합니다.
-   **Cleanup 함수**: 컴포넌트가 사라질 때 지도 인스턴스를 제거하여 메모리 누수를 방지합니다.

이 패턴을 적용하면 Leaflet이 항상 유효한 DOM 요소를 참조하게 되어 `_leaflet_pos` 관련 오류를 해결할 수 있습니다.

이 오류는 Leaflet이 DOM 요소를 완전히 로드하기 전에 지도를 초기화하려고 할 때 발생합니다. 다음과 같이 수정하면 해결됩니다:
주요 수정 사항:

```jsx
// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ onLocationChange }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null); // DOM 참조 추가
  const markerRef = useRef(null);

  useEffect(() => {
    // DOM 요소가 존재하는지 확인
    if (!mapContainerRef.current) return;

    // 이미 지도가 초기화되었다면 리턴
    if (mapRef.current) return;

    // 약간의 지연을 두고 지도 초기화 (DOM이 완전히 준비될 때까지)
    const timer = setTimeout(() => {
      try {
        const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // 지도가 완전히 로드된 후 위치 찾기
        map.whenReady(() => {
          map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
        });

        map.on('locationfound', function (e) {
          onLocationChange(e.latlng);

          // 기존 마커 제거
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // 새 마커 추가
          markerRef.current = L.marker(e.latlng)
            .addTo(map)
            .bindPopup('내 현재 위치')
            .openPopup();
        });

        map.on('locationerror', function (e) {
          alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
          console.error("Location error:", e);
        });

      } catch (error) {
        console.error("Map initialization error:", error);
      }
    }, 100); // 100ms 지연

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [onLocationChange]);

  // 지도 크기 재조정 (윈도우 리사이즈 시)
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
        height: 'calc(100vh - 60px)', 
        borderTop: '3px solid #2c3e50' 
      }}
    />
  );
}

export default MapComponent;
```
useRef로 DOM 참조 - id 대신 ref를 사용하여 DOM 요소를 직접 참조
setTimeout 추가 - DOM이 완전히 렌더링될 때까지 100ms 지연
map.whenReady() 사용 - 지도가 완전히 준비된 후 위치 찾기 실행
마커 참조 관리 - markerRef로 마커를 추적하여 중복 방지
에러 처리 - try-catch로 초기화 오류 캡처
리사이즈 핸들러 - 윈도우 크기 변경 시 지도 크기 재조정

이렇게 하면 _leaflet_pos 오류가 해결됩니다!