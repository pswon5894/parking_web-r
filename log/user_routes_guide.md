# `server/routes/user.js` API 가이드

이 문서는 `Login.js`에서 로그인 버튼을 클릭했을 때 사용자 정보를 받아 MongoDB의 `User` 컬렉션에 저장하는 API를 `server/routes/user.js`에 어떻게 작성하는지 설명합니다.

## 1. `user.js` 라우터 설정

아래 코드는 사용자 등록을 처리하는 API 엔드포인트 예시입니다. `/register` 경로로 `POST` 요청을 받으면, 요청 본문(body)에 포함된 `username`, `password`, `location`, `parktime` 정보를 사용하여 새로운 `User` 문서를 생성하고 데이터베이스에 저장합니다.

### `server/routes/user.js` 전체 코드

```javascript
// server/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../model/User');

/**
 * @route   POST /api/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        // 1. 클라이언트에서 전송된 데이터 확인
        const { username, password, location, parktime } = req.body;

        // 2. 필수 정보가 모두 있는지 확인
        if (!username || !password || !location || !parktime) {
            return res.status(400).json({ msg: '모든 필드를 입력해주세요.' });
        }

        // 3. 데이터베이스에 동일한 사용자가 있는지 확인
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: '이미 존재하는 사용자입니다.' });
        }

        // 4. 새로운 사용자 모델 생성
        user = new User({
            username,
            password, // 실제 프로덕션 환경에서는 비밀번호를 해싱(hashing)해야 합니다.
            location,
            parktime
        });

        // 5. 데이터베이스에 사용자 정보 저장
        await user.save();

        // 6. 성공적으로 저장되었음을 클라이언트에 알림
        res.status(201).json({
            msg: '사용자 등록이 완료되었습니다.',
            userId: user.id
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

module.exports = router;
```

## 2. `server.js`에 라우터 적용하기

작성된 `user.js` 라우터를 `server.js`에서 사용하도록 설정해야 합니다. `server.js`에 아래 코드를 추가하여 `/api/user` 경로로 들어오는 모든 요청을 `user.js` 파일이 처리하도록 만듭니다.

### `server/server.js` 일부

```javascript
const express = require('express');
const app = express();
const userRoutes = require('./routes/user'); // user.js 파일을 불러옵니다.

// Body Parser 미들웨어 추가 (Express v4.16.0 이상)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// '/api/user' 경로에 userRoutes를 마운트합니다.
app.use('/api/user', userRoutes);

// ... (기타 서버 설정)
```
이렇게 설정하면 `POST /api/user/register` 요청을 처리할 수 있게 됩니다.

## 3. 프론트엔드(`Login.js`)에서 API 호출 예시

`Login.js` 컴포넌트에서 `fetch`나 `axios`를 사용하여 서버로 데이터를 보내는 방법의 예시입니다.

```javascript
// client/src/components/Login.js 에서의 함수 예시

const handleLogin = async () => {
    const userData = {
        username: 'testuser',
        password: 'password123',
        location: '서울',
        parktime: '2024-01-01 12:00'
    };

    try {
        const response = await fetch('/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('등록 성공:', data.msg);
            // 등록 성공 후 로직 (예: 페이지 이동)
        } else {
            console.error('등록 실패:', data.msg);
        }
    } catch (error) {
        console.error('네트워크 오류:', error);
    }
};
```
