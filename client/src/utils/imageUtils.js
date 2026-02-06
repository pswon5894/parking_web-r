// src/utils/imageUtils.js
export function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// readImage(file) 함수는 브라우저에서 파일 객체(예: 이미지 파일)를 읽어서 
// Base64 인코딩된 문자열(Data URL)로 변환해주는 역할을 합니다.
// 즉, 사용자가 <input type="file"> 같은 걸로 업로드한 이미지를 
// 텍스트 형태의 문자열로 바꿔서, 미리보기나 서버 전송 등에 활용할 수 있게 해줍니다.

// const reader = new FileReader();

// - 브라우저 내장 객체인 FileReader를 이용해 파일을 읽을 준비를 합니다.
// - Promise 반환
// 함수는 Promise를 반환합니다.
// - 성공하면 resolve(reader.result)
// - 실패하면 reject(error)
// - → 비동기적으로 파일을 읽고, 완료되면 결과를 돌려줍니다.
// - onload 이벤트

// reader.onload = () => resolve(reader.result);

// - 파일 읽기가 끝나면 reader.result에 Data URL이 들어있고, 이를 resolve로 반환합니다.

// 이 함수는 이미지 파일을 브라우저에서 읽어 
// Base64 문자열(Data URL)로 변환해주는 유틸 함수입니다.
// 이를 통해 업로드한 이미지를 화면에 바로 보여주거나, 
// 서버에 문자열 형태로 전송할 수 있습니다.

// 브라우저에서 미리보기 용도로 사용, 추후 서버 전송용으로도 사용 가능

//MongoDB에 Base64 인코딩된 문자열을 저장할 수 있으며, 
// 이는 특히 소형 이미지, 썸네일, 또는 소규모 바이너리 데이터를 
// 문서 내에 직접 포함시킬 때 유용합니다 Quora, Reddit. 다만, 
// 데이터를 문자열로 변환하므로 원본 바이너리 대비 약 33% 크기가 증가하며, 
// 대용량 파일 저장 시 성능 저하와 문서 크기 제한(16MB)에 주의