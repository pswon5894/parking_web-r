## 에러 발생
```
ERROR
onLocationChange is not a function
TypeError: onLocationChange is not a function
    at NewClass.<anonymous> (http://localhost:3000/static/js/bundle.js:39396:5)
    at NewClass.fire (http://localhost:3000/static/js/bundle.js:4392:16)
    at NewClass._handleGeolocationResponse (http://localhost:3000/static/js/bundle.js:7282:12)
```
useMaoLocation 훅에서 onLocationChange가 함수가 아닌 값 (또는 빈 값)

```js
// 위치 찾기 성공 핸들러
  const handleLocationFound = useCallback(async (e) => {
    const { lat, lng } = e.latlng;

    // 서버에 위치 업데이트 기록
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
    onLocationChange(e.latlng);         //왜 함수가 아닌값?

    // 기존 마커 제거
    if (currentLocationMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(currentLocationMarkerRef.current);
    }

    // 새 마커 생성
    const popupContent = createPopupContent(
      lat,
      lng,
      Date.now(),
      null,
      '내 현재 위치'
    );

    currentLocationMarkerRef.current = L.marker([lat, lng])
      .addTo(mapRef.current)
      .bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
      })
      .openPopup();
  }, [mapRef, currentLocationMarkerRef, onLocationChange, user, serverUrl]);
```

선택적인 기능이라 값이 비어있을 수도 있다, 빈값이면 안쓰게해야한다


```js
// src/App.js
return (
    <div className={darkMode ? "app dark" : "App"}>
      <ThemeToggle />
      <Login />
      <h2 className="main-h2">주차 위치 지도</h2>
      
      {/* markers와 openImageModal을 MapComponent에 전달 */}
      <MapComponent 
        // onLocationChange={handleLocationChange}          // 주석 처리가 되어있었다
        // markers={markers}
        onMarkerImageClick={openImageModal}
      />
      
      {/* <SaveButton onSave={handleSaveLocation} /> */}
      
      <ImageModal 
        isOpen={imageModalOpen} 
        src={modalImageSrc} 
        onClose={closeImageModal} 
      />
    </div>
  );
  ```

```js
// src/components/MapComponent.js
function MapComponent({ onLocationChange, markers = [], onMarkerImageClick }) {
  // Refs
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const savedMarkersRef = useRef([]);

  // Context
  const { user, serverUrl } = useAuth();

  // 현재 위치 관리
  const {
    refreshLocation,
    handleLocationFound,
    handleLocationError
  } = useMapLocation(
    mapRef,
    currentLocationMarkerRef,
    onLocationChange,
    user,
    serverUrl
  );
```

## 문제
함수가 아닌 값이 된 이유는

App.js에서 prop을 안 넘겼기 때문


##  해결
```js   //훅은 안전하게
// src/hooks/useMapLocation.js
    setCurrentLatLng({ lat, lng });
    onLocationChange?.(e.latlng);   // 함수가 비어있을수도, 옵셔널 체이닝 연산자, - ?. 는 앞의 객체나 함수가 존재할 경우에만 접근하거나 호출
```

```js       // prop 넘기기
// src/App.js
<MapComponent 
        onLocationChange={handleLocationChange}
        // markers={markers}
        onMarkerImageClick={openImageModal}
      />
```
app.jsx
JSX 속성(attribute) 방식으로 props를 전달

MapComponent에서 받는 방식, 구조분해 할당" 문법
function MapComponent({ onLocationChange, markers = [], onMarkerImageClick }) {

원래
```js
    function MapComponent(props) {
  const onLocationChange = props.onLocationChange;
  const onMarkerImageClick = props.onMarkerImageClick;
  const markers = props.markers ?? [];
}
```

{} 중괄호의 의미, "자바스크립트 값을 넣겠다"
onLocationChange={handleLocationChange}     //함수 전달