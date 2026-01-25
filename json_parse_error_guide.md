# "Unexpected token '<', ... is not valid JSON" 에러 해결 가이드

회원가입 시 "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"과 같은 에러가 발생하는 원인과 해결 방법을 설명합니다.

## 1. 에러의 핵심 원인

이 에러는 **클라이언트(프론트엔드)가 서버로부터 JSON 형식의 응답을 기대했지만, 실제로는 HTML 문서를 받았을 때 발생**합니다.

클라이언트의 `fetch` 코드에서는 보통 응답을 받으면 `response.json()`을 호출하여 JSON으로 변환하려고 시도합니다.

```javascript
// 클라이언트는 이런 식으로 JSON 응답을 기대합니다.
const data = await response.json(); 
```

하지만 서버가 HTML을 보내면, `response.json()`은 `<!DOCTYPE html>...` 또는 `<html>...` 과 같은 HTML 코드의 첫 글자인 `<`를 만나게 됩니다. 이 문자는 유효한 JSON의 시작이 아니므로, 파싱(parsing) 에러가 발생하는 것입니다.

## 2. 왜 서버가 JSON 대신 HTML을 보냈을까?

서버가 정상적으로 JSON 응답을 보내지 않고 HTML을 보내는 경우는 주로 다음과 같습니다.

### 가장 흔한 원인: API 경로를 찾을 수 없음 (404 Not Found)

클라이언트가 요청한 API 엔드포인트(예: `/api/user/register`)를 서버가 찾지 못하는 경우입니다.

React 같은 SPA(Single Page Application) 환경에서는 보통 어떤 경로로 요청이 들어와도 항상 `index.html` 파일을 보내주는 "catch-all" 설정이 되어 있습니다. API 요청이 서버의 특정 라우트(route)에 등록되어 있지 않으면, 서버는 이 요청을 일반 페이지 요청으로 간주하고 `index.html`을 응답으로 보냅니다.

**해결책:**

`server/server.js` 파일에 `user.js` 라우터가 올바르게 연결되었는지 확인하세요. 아래와 같이 `/api/user` 경로로 들어오는 요청을 `userRoutes`가 처리하도록 설정해야 합니다.

**`server/server.js` 설정 확인:**
```javascript
const express = require('express');
const app = express();
const userRoutes = require('./routes/user'); // 1. user.js를 import

// Body Parser 미들웨어 (이것이 없으면 req.body가 undefined가 됩니다)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. '/api/user' 경로로 들어오는 요청을 userRoutes로 전달
// 이 부분이 없거나 잘못 설정되면 404 에러가 발생합니다.
app.use('/api/user', userRoutes); 

// SPA를 위한 설정 (React 앱의 build 폴더 서빙)
// 이 설정 때문에 API 라우트를 못 찾으면 index.html이 반환됩니다.
app.use(express.static('client/build'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// ...
```

### 원인 2: 서버 내부 오류 (500 Internal Server Error)

API 코드가 실행되는 도중에 에러가 발생했지만, `try...catch` 문으로 에러를 잡아 JSON 형식의 에러 메시지를 보내주지 않은 경우입니다. 에러 처리가 제대로 되어 있지 않으면, Express 서버는 기본 HTML 에러 페이지를 응답으로 보낼 수 있습니다.

**해결책:**

`server/routes/user.js`의 API 코드 전체가 `try...catch` 블록으로 감싸져 있는지 확인하고, `catch` 블록에서 JSON 형식으로 에러 메시지를 보내도록 수정하세요.

**`server/routes/user.js`의 올바른 에러 처리:**
```javascript
router.post('/register', async (req, res) => {
    try {
        // ... (회원가입 로직)
    } catch (err) {
        console.error(err.message); // 서버 로그에 에러 기록
        
        // 클라이언트에게는 JSON 형식으로 에러 응답을 보냄
        res.status(500).json({ msg: '서버 오류가 발생했습니다.' }); 
    }
});
```

### 원인 3: 프록시(Proxy) 설정 문제 (개발 환경)

React 개발 서버(예: `localhost:3000`)에서 API 서버(예: `localhost:5000`)로 요청을 보낼 때 `package.json`에 프록시 설정을 사용합니다. 이 설정이 잘못되면 API 요청이 백엔드로 제대로 전달되지 않고, React 개발 서버가 대신 응답하면서 `index.html`을 보내게 됩니다.

**`client/package.json` 프록시 설정 확인:**
```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": { ... },
  "scripts": { ... },
  "eslintConfig": { ... },
  "browserslist": { ... },
  "proxy": "http://localhost:5000" // API 서버 주소가 올바른지 확인
}
```

## 3. 디버깅 하는 방법

1.  **브라우저 개발자 도구 확인**:
    *   `F12`를 눌러 개발자 도구를 열고 **[Network]** 탭으로 이동합니다.
    *   회원가입 버튼을 눌러 API 요청을 보냅니다.
    *   `register` 또는 비슷한 이름의 요청을 클릭합니다.
    *   **[Response]** 탭을 확인하여 서버가 실제로 어떤 내용을 보냈는지 확인합니다. HTML 코드가 보인다면 이 문제일 확률이 99%입니다.
    *   **[Headers]** 탭에서 Status Code가 `404 Not Found` 인지 `500 Internal Server Error` 인지 확인하여 원인을 좁힐 수 있습니다.

2.  **서버 터미널 로그 확인**:
    *   백엔드 서버가 실행 중인 터미널(콘솔)에 에러 메시지가 출력되지 않았는지 확인합니다. 코드 실행 오류가 발생했다면 대부분 로그가 남아있습니다.
