react-dom-client.development.js:28003 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
DomUtil.js:247 Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')
    at getPosition (DomUtil.js:247:1)
    at NewClass._getMapPanePos (Map.js:1488:1)
    at NewClass.containerPointToLayerPoint (Map.js:1039:1)
    at NewClass._getCenterLayerPoint (Map.js:1525:1)
    at NewClass._getCenterOffset (Map.js:1530:1)
    at NewClass._tryAnimatedZoom (Map.js:1671:1)
    at NewClass.setView (Map.js:194:1)
    at NewClass._handleGeolocationResponse (Map.js:700:1)


# Solution: `Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')` in Leaflet with React

## Problem Description

You encountered the error:
`Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos') at getPosition (DomUtil.js:247:1)`

This error typically indicates that Leaflet is attempting to access properties of a DOM element that it expects to be a valid map container, but that element is either `undefined`, `null`, or has been unmounted from the DOM.

In a React application, this often arises due to a mismatch between React's component lifecycle and Leaflet's direct DOM manipulation. Specifically:

*   **Timing Issue:** Leaflet's `L.map()` call might execute before the target `div` element (`#map` in your case) is fully rendered and attached to the DOM by React.
*   **Re-renders:** If the React component containing the map re-renders, the original DOM element that Leaflet attached to might be replaced, but the Leaflet instance still holds a reference to the old, unmounted element.
*   **Improper Cleanup:** If the Leaflet map instance is not correctly removed when the React component unmounts, it can lead to memory leaks or attempts to operate on a non-existent DOM element.

Leaflet expects a stable DOM element to attach to. When React, during its rendering cycle, might detach or re-create elements, Leaflet can get confused, leading to this `TypeError` when it tries to query properties like `_leaflet_pos` on a non-existent or invalid DOM node.

## Proposed Solution: Using `useRef` for the Map Container

To effectively manage external DOM-manipulating libraries like Leaflet within React, the recommended approach is to use React's `useRef` hook. A `ref` provides a way to access DOM nodes or React elements created in the render method.

Here's how `useRef` addresses the issue:

1.  **Stable Reference:** Instead of relying on a string `id` (like `id="map"`) to find the DOM element, we create a `ref` object. This `ref` is attached directly to the `div` element that serves as the map container.
2.  **Guaranteed DOM Presence:** By calling `L.map()` only when `mapContainerRef.current` (the actual DOM node) is available and not `null`, we ensure that Leaflet always initializes on an existing and stable DOM element.
3.  **Encapsulation:** The `ref` helps encapsulate the DOM interaction, clearly delineating where React manages the element and where Leaflet takes over its specific part of the DOM.

This ensures that Leaflet has a consistent and reliable DOM target, preventing it from trying to operate on an `undefined` or unmounted element.

## Updated `MapComponent.js` Code

Here is the updated `MapComponent.js` that incorporates the `useRef` hook for the map container:

```javascript
// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Fix for default icon issues with Webpack (if applicable)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapComponent({ onLocationChange }) {
  const mapRef = useRef(null); // Ref to store the Leaflet map instance
  const mapContainerRef = useRef(null); // Ref to store the map container DOM element

  useEffect(() => {
    // Initialize map only once and only when the container ref is available
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([37.5665, 126.9780], 13); // Default view
      mapRef.current = map; // Store map instance in ref

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });

      map.on('locationfound', function (e) {
        onLocationChange(e.latlng); // Pass location to parent

        // Clear existing markers if any
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add a marker for the current location
        L.marker(e.latlng)
          .addTo(map)
          .bindPopup('내 현재 위치')
          .openPopup();

        // L.circle(e.latlng, e.accuracy).addTo(map); // Optional: accuracy circle
      });

      map.on('locationerror', function (e) {
        alert(`위치 정보를 사용할 수 없습니다: ${e.message}`);
        console.error("Location error:", e);
      });
    }

    // Cleanup function: remove the Leaflet map instance when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange]); // Dependency array: re-run if onLocationChange changes

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: 'calc(100vh - 60px)', borderTop: '3px solid #2c3e50' }}>
      {/* The map will be rendered here by Leaflet */}
    </div>
  );
}

export default MapComponent;
```

## Why this `useRef` Solution Works for Leaflet in React

The `useRef` hook in React provides a way to persist mutable values between renders without causing re-renders when the ref's `.current` value is changed. In the context of integrating third-party DOM manipulation libraries like Leaflet, `useRef` is crucial because it allows us to:

1.  **Access the Actual DOM Node:** When you attach a `ref` to a DOM element (e.g., `<div ref={mapContainerRef}>`), React ensures that `mapContainerRef.current` points directly to that rendered DOM element once the component has mounted. This is critical because Leaflet needs a concrete DOM element to initialize and attach itself to.
2.  **Control Initialization Timing:** By placing the Leaflet map initialization logic inside a `useEffect` hook and checking `if (mapContainerRef.current && !mapRef.current)`, we guarantee two things:
    *   `mapContainerRef.current` exists: The `div` element is present in the DOM.
    *   `!mapRef.current`: The Leaflet map has not been initialized yet for this component instance.
    This prevents Leaflet from trying to attach to a `null` or `undefined` element and ensures that `L.map()` is only called once per component instance.
3.  **Prevent Conflicts with React's Reconciliation:** React works by creating a virtual DOM and efficiently updating the actual DOM. Libraries that directly manipulate the DOM can interfere with React's process. By giving Leaflet its own dedicated DOM node via a `ref` and letting Leaflet manage that specific subtree, we effectively tell React, "Don't touch this part; Leaflet is handling it." React will then leave that DOM node alone, preventing conflicts that could lead to elements being unmounted or properties becoming `undefined` unexpectedly from Leaflet's perspective.
4.  **Proper Cleanup:** The `useEffect` cleanup function (`return () => { ... }`) is equally important. When the `MapComponent` unmounts (e.g., if you navigate away from the page where the map is displayed), this cleanup function will be executed. `mapRef.current.remove()` tells Leaflet to properly destroy its map instance and remove all associated DOM elements and event listeners. This prevents memory leaks and ensures that if the `MapComponent` is mounted again, it starts with a clean slate, avoiding issues with old, detached Leaflet instances.

In summary, `useRef` provides a stable bridge between React's component lifecycle and Leaflet's DOM requirements, allowing both to coexist and function correctly without interfering with each other's operations.


에러 내용 요약
Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')


이 에러는 Leaflet 지도 컨테이너 DOM이 존재하지 않거나 아직 준비되지 않았는데
setView() 또는 locate() 같은 메서드가 호출될 때 발생합니다.

스택 트레이스를 보면:

Map._handleGeolocationResponse
Map.setView
_tryAnimatedZoom


👉 위치 정보(geolocation)를 받아서 지도를 이동시키는 도중
지도 DOM이 없어서 터진 에러입니다.

React + Leaflet에서 자주 발생하는 원인
1️⃣ 지도가 완전히 생성되기 전에 map.locate() / map.setView() 호출

❌ 문제 코드 예시

const map = useMap();

useEffect(() => {
  map.locate();
}, []);


✔ 해결 방법 — whenReady() 사용

useEffect(() => {
  if (!map) return;

  map.whenReady(() => {
    map.locate();
  });
}, [map]);

2️⃣ <MapContainer />가 조건부 렌더링 중일 때
{showMap && <MapContainer ... />}


showMap이 false가 되면서 지도는 사라졌는데
위치 응답은 나중에 도착 → 에러 발생

✔ 해결 방법

지도 unmount 이후에는 map 함수 호출 금지

useEffect(() => {
  let mounted = true;

  map.whenReady(() => {
    if (mounted) map.locate();
  });

  return () => {
    mounted = false;
  };
}, [map]);

3️⃣ React 18 StrictMode (가장 흔한 원인 ⚠️)

개발 모드에서 컴포넌트를 2번 mount / unmount 합니다.
Leaflet은 이를 제대로 처리하지 못합니다.

📌 특징

개발 환경에서만 에러 발생

배포하면 정상 동작

해결 방법 A (테스트용)
// index.js
// <React.StrictMode> 제거
<App />

해결 방법 B (권장)
const didInit = useRef(false);

useEffect(() => {
  if (didInit.current) return;
  didInit.current = true;

  map.whenReady(() => {
    map.locate();
  });
}, [map]);

4️⃣ 지도 컨테이너가 display: none 상태

Leaflet은 숨겨진 DOM에서 좌표 계산을 못 합니다.

❌ 문제

.map {
  display: none;
}


✔ 해결

.map {
  visibility: hidden;
}


또는 보이게 만든 뒤 setView() 호출

5️⃣ 위치 이동 애니메이션 중 충돌

에러 스택에 AnimatedZoom이 있는 경우

✔ 해결 방법

map.locate({ setView: false });


또는

map.setView(latlng, zoom, { animate: false });

✅ 가장 안전한 react-leaflet 패턴 (추천)
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";

function LocateUser() {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    map.whenReady(() => {
      map.locate({ setView: true, maxZoom: 16 });
    });
  }, [map]);

  return null;
}

정리

✔ React 문제가 아님
✔ Leaflet이 DOM 준비 전/해제 후 실행돼서 발생
✔ React 18 StrictMode + locate/setView 조합이 가장 흔한 원인

원하시면
📌 MapContainer 코드
📌 locate() 또는 setView() 호출 위치