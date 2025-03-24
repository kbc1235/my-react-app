/**
 * 현재 실행 환경을 확인하는 함수
 * @returns {Object} 환경 정보
 */
export const getEnvironment = () => {
  // 배포 환경이나 API_MODE가 'production'으로 설정된 경우 프로덕션으로 간주
  const isProduction = import.meta.env.VITE_API_MODE === 'production' || import.meta.env.PROD === true;
  const isNetlify = Boolean(import.meta.env.NETLIFY) || window.location.hostname.includes('netlify.app');
  
  console.log('환경 변수 확인:', {
    VITE_API_MODE: import.meta.env.VITE_API_MODE,
    PROD: import.meta.env.PROD,
    NETLIFY: import.meta.env.NETLIFY,
    호스트명: window.location.hostname
  });
  
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
  const { isProduction, isNetlify } = getEnvironment();
  
  // 프로덕션(Netlify) 환경에서는 Netlify Functions 사용
  if (isProduction || isNetlify) {
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
  const { isProduction, isNetlify } = getEnvironment();
  const prefix = getApiEndpointPrefix();
  const url = `${prefix}${endpoint}`;
  
  console.log(`API 요청: ${url} (${isProduction ? 'Production' : 'Development'} 모드, Netlify: ${isNetlify ? '예' : '아니오'})`);
  
  try {
    // 프로덕션 환경에서는 인증 헤더를 클라이언트에서 보내지 않음 (Netlify Functions에서 처리)
    if (isProduction || isNetlify) {
      // 콘솔에 요청 정보 로깅 (디버깅용)
      console.log('API 요청 상세정보:', {
        URL: url,
        메서드: options.method || 'GET',
        바디: options.body ? '존재함' : '없음'
      });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
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