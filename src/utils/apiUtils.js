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
    // 수정된 옵션 - API 키를 바디에 포함시키지 않음
    const modifiedOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const response = await fetch(url, modifiedOptions);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
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