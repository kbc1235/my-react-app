/**
 * 현재 실행 환경을 확인하는 함수
 * @returns {Object} 환경 정보
 */
export const getEnvironment = () => {
  const isProduction = import.meta.env.VITE_API_MODE === 'production';
  const isNetlify = Boolean(import.meta.env.NETLIFY);
  
  return {
    isProduction,
    isNetlify,
    isDevelopment: !isProduction,
    apiMode: import.meta.env.VITE_API_MODE || 'development'
  };
};

/**
 * 환경에 맞는 API 엔드포인트 접두사를 반환하는 함수
 * @returns {string} API 엔드포인트 접두사
 */
export const getApiEndpointPrefix = () => {
  const { isProduction } = getEnvironment();
  
  // 프로덕션(Netlify) 환경에서는 Netlify Functions 사용
  if (isProduction) {
    return '/.netlify/functions/notion';
  }
  
  // 개발 환경에서는 Vite 프록시 사용
  return '/api/notion';
};

/**
 * Notion API 요청 함수 - 환경에 따라 적절한 방식으로 요청
 * @param {string} endpoint - API 엔드포인트 경로 (/databases/:id 형식)
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Response>} fetch 응답
 */
export const notionApiRequest = async (endpoint, options = {}) => {
  const { isProduction } = getEnvironment();
  const prefix = getApiEndpointPrefix();
  const url = `${prefix}${endpoint}`;
  
  console.log(`API 요청: ${url} (${isProduction ? 'Production' : 'Development'} 모드)`);
  
  try {
    // 프로덕션 환경에서는 인증 헤더를 클라이언트에서 보내지 않음 (Netlify Functions에서 처리)
    if (isProduction) {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } 
    // 개발 환경에서는 API 키를 포함한 요청
    else {
      const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }
      
      return response;
    }
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