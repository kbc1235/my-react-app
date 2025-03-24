/**
 * 현재 실행 환경을 확인하는 함수
 * @returns {Object} 환경 정보
 */
export const getEnvironment = () => {
  // 항상 프로덕션 모드로 설정
  console.log('환경 설정: 항상 프로덕션 모드로 동작');
  
  return {
    isProduction: true,
    isNetlify: true,
    isDevelopment: false,
    apiMode: 'production'
  };
};

/**
 * 환경에 맞는 API 엔드포인트 접두사를 반환하는 함수
 * @returns {string} API 엔드포인트 접두사
 */
export const getApiEndpointPrefix = () => {
  // 항상 Netlify Functions 사용
  return '/.netlify/functions/notion';
};

/**
 * Notion API 요청 함수 - 환경에 따라 적절한 방식으로 요청
 * @param {string} endpoint - API 엔드포인트 경로 (/databases/:id 형식)
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Response>} fetch 응답
 */
export const notionApiRequest = async (endpoint, options = {}) => {
  const prefix = getApiEndpointPrefix();
  const url = `${prefix}${endpoint}`;
  
  console.log(`API 요청: ${url} (프로덕션 모드)`);
  
  try {
    // 콘솔에 요청 정보 로깅 (디버깅용)
    console.log('API 요청 상세정보:', {
      URL: url,
      메서드: options.method || 'GET',
      바디: options.body ? '존재함' : '없음'
    });
    
    // 요청 바디에 API 키 추가
    let requestBody = {};
    try {
      if (options.body) {
        requestBody = JSON.parse(options.body);
      }
    } catch (e) {
      console.error('요청 바디 파싱 오류:', e);
    }
    
    // API 키를 바디에 추가
    requestBody.apiKey = import.meta.env.VITE_NOTION_API_KEY;
    
    // 수정된 옵션
    const modifiedOptions = {
      ...options,
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const response = await fetch(url, modifiedOptions);
    
    if (!response.ok) {
      // 응답 텍스트 출력 시도
      try {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
      } catch (textError) {
        console.error('API 오류 응답 읽기 실패:', textError);
      }
      
      throw new Error(`API 오류: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

// 애플리케이션 시작 시 환경 정보 로깅 - 모든 함수 정의 후에 실행
const env = getEnvironment();
console.log('애플리케이션 환경 정보:', {
  모드: env.apiMode,
  프로덕션: env.isProduction ? '예' : '아니오',
  Netlify: env.isNetlify ? '예' : '아니오',
  API엔드포인트: getApiEndpointPrefix()
}); 