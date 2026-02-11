// src/utils/popupUtils.js

/**
 * 지도 마커의 팝업 콘텐츠를 생성합니다.
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {string|number} timestamp - 타임스탬프
 * @param {string|null} imageBase64 - Base64 인코딩된 이미지
 * @param {string} title - 팝업 제목
 * @returns {string} HTML 문자열
 */
export const createPopupContent = (lat, lng, timestamp, imageBase64, title = '🚗 주차 위치') => {
  return `
    <div style="text-align: center; min-width: 220px;">
      <b style="font-size: 16px;">${title}</b><br/>
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
};