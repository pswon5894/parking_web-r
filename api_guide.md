# Express.js에서 `routes` 폴더를 사용한 API 구현 방법

안녕하세요! Express.js 서버에서 `routes` 폴더를 사용하여 API를 모듈화하고 관리하는 방법에 대해 안내해 드리겠습니다. 이 방식은 코드를 깔끔하게 정리하고, 기능별로 파일을 분리하여 유지보수를 쉽게 만듭니다.

현재 `server.js` 파일에 라우팅 로직이 직접 포함되어 있는데, 이를 `routes` 폴더로 분리하는 과정을 단계별로 설명하겠습니다.

## 왜 `routes` 폴더를 사용해야 할까요?

-   **모듈성**: 기능(예: 사용자, 자동차, 주차)별로 API 엔드포인트를 별도의 파일로 그룹화할 수 있습니다.
-   **가독성**: `server.js` 파일은 서버 설정, 미들웨어 연결 등 핵심 역할에만 집중하게 되어 코드가 간결해집니다.
-   **확장성**: 새로운 API 기능이 추가될 때, `routes` 폴더에 새 파일을 추가하기만 하면 되므로 확장이 용이합니다.

---

## 단계별 구현 가이드

### 1단계: `routes` 폴더 및 라우트 파일 생성

먼저 `server` 디렉토리 내에 `routes`라는 폴더를 생성합니다. 그리고 그 안에 `car.js`와 같은 라우트 파일을 만듭니다.

```
server/
├── routes/
│   └── car.js       <-- 새로 만들 파일
├── node_modules/
├── model/
├── package.json
└── server.js
```

### 2단계: `car.js` 파일에 라우터 설정하기

`server/routes/car.js` 파일을 열고 다음 코드를 작성합니다.

-   `express.Router()`를 사용하여 새로운 라우터 객체를 생성합니다.
-   이 라우터 객체에 `get`, `post` 등 HTTP 메서드를 사용하여 API 엔드포인트를 정의합니다.
-   마지막으로 `module.exports`를 사용하여 라우터 객체를 내보내야 다른 파일에서 가져다 쓸 수 있습니다.

**`server/routes/car.js`**
```javascript
const express = require('express');
const router = express.Router();

// 예시: /api/car/ 경로로 GET 요청이 들어왔을 때의 처리
router.get('/', (req, res) => {
    res.json({ message: '자동차 API에 오신 것을 환영합니다!' });
});

// 예시: /api/car/status 경로로 GET 요청이 들어왔을 때의 처리
router.get('/status', (req, res) => {
    res.json({ status: 'available', car_id: 123 });
});

// 예시: /api/car/register 경로로 POST 요청이 들어왔을 때의 처리
router.post('/register', (req, res) => {
    const { carModel, year } = req.body; // 요청의 body에서 데이터를 받음

    // (실제로는 여기서 데이터베이스에 자동차 정보를 저장하는 로직이 들어갑니다)

    console.log('등록된 자동차 정보:', { carModel, year });

    res.status(201).json({
        message: '자동차가 성공적으로 등록되었습니다.',
        data: { carModel, year }
    });
});


// 설정한 라우터 객체를 내보냅니다.
module.exports = router;
```

### 3단계: `server.js`에서 라우터 사용하기

이제 `server.js` 파일에서 `car.js`가 내보낸 라우터 모듈을 가져와서 Express 애플리케이션에 미들웨어로 등록합니다.

`app.use('/api/car', carRoutes)` 코드는 `/api/car`로 시작하는 모든 요청을 `car.js`에 정의된 라우터가 처리하도록 연결해주는 역할을 합니다.

**`server/server.js` 수정**

```javascript
// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
// ... (기존 코드 생략) ...

// car.js 라우트 파일을 불러옵니다.
const carRoutes = require('./routes/car'); // <-- 이 줄을 추가하세요!

const app = express();
const port = 5000;
// ... (기존 코드 생략) ...

// POST 요청의 body를 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// '/api/car' 경로로 들어오는 요청은 carRoutes가 처리하도록 설정합니다.
app.use('/api/car', carRoutes); // <-- 이 줄을 추가하세요!

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, '/')));

// ... (기존 로그인/로그아웃 라우트 코드 생략) ...

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
```

## 테스트 방법

서버를 실행한 후 (`node server/server.js`), 웹 브라우저나 Postman과 같은 API 테스트 도구를 사용하여 아래 주소로 접속해보세요.

1.  **GET `http://localhost:5000/api/car`**:
    -   성공하면 `{"message":"자동차 API에 오신 것을 환영합니다!"}` 라는 JSON 응답을 볼 수 있습니다.

2.  **GET `http://localhost:5000/api/car/status`**:
    -   성공하면 `{"status":"available","car_id":123}` 라는 JSON 응답을 볼 수 있습니다.

3.  **POST `http://localhost:5000/api/car/register`** (Postman 사용):
    -   Body 탭에서 `raw`와 `JSON`을 선택하고 아래와 같이 입력 후 요청을 보내보세요.
    ```json
    {
        "carModel": "Tesla Model 3",
        "year": 2024
    }
    ```
    -   성공하면 `201 Created` 상태 코드와 함께 등록 확인 메시지를 JSON으로 받게 됩니다.

이와 같은 방식으로 `routes` 폴더에 `user.js`, `parking.js` 등 기능별로 파일을 추가하여 API를 체계적으로 관리할 수 있습니다.
