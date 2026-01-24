js보다 느려짐
웹팩 때문에 초기 느리게 켜지는 것일 수도 있다

리액트 + express + mongodb
화면 페이지 + 서버 + db

유저의 주차 정보를 저장하는 모델을 만드려하는데 
User 모델과 Car 모델로 나누는것이 나을까?

1. 현재 구조 (User 모델에 주차 정보 포함)(반정규화)
- 장점
- 단순한 구조: 유저와 주차 정보가 한 문서에 들어있음.
- 빠른 구현 가능.

- 단점
- 유저당 여러 차량/주차 기록을 저장하기 어려움. (차량공유이기에 문제 가능성 낮음)
- 주차 정보가 많아지면 User 문서가 비대해짐.
- 차량 정보와 주차 기록을 따로 관리하기 힘듦.

2. User 모델 + Car 모델 분리
- 장점
- 유저와 차량/주차 기록을 독립적으로 관리 가능.
- 한 유저가 여러 차량을 등록할 수 있음.
- 주차 기록을 별도로 쌓을 수 있어 확장성 높음.
- 나중에 차량별 속성(차종, 색상, 번호판 등)을 추가하기 쉬움.

- 단점
- 구조가 조금 복잡해짐.
- 관계를 맺어야 하므로 쿼리 시 populate 등을 사용해야 함.

3. 추천 방향
- 단순히 유저당 1개의 주차 정보만 저장 → User 모델에 포함해도 충분.
- 유저당 여러 차량/주차 기록을 저장 → Car 모델을 분리하는 것이 훨씬 유연하고 확장성 있음.
- 장기적으로 서비스 확장 가능성 (예: 주차장 관리, 차량별 기록, 결제 등) → 분리하는 것이 안전한 선택.

MongoDB는 유연한 스키마와 빠른 개발 속도 때문에 스타트업이나 프로토타입에 적합하지만, 주차 관리처럼 관계형 데이터가 많거나 트랜잭션 안정성이 중요한 경우에는 PostgreSQL 같은 RDBMS가 더 나은 선택

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
