/**
 * CORS 문제를 우회하기 위한 프록시 서비스를 사용하는 함수
 * 로컬 Vite 프록시가 작동하지 않을 경우를 대비한 대체 방법입니다.
 * 
 * @param {string} url - 접근하려는 원본 URL
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Response>} - fetch 응답
 */
export const fetchWithCorsProxy = async (url, options = {}) => {
  // 여러 공개 CORS 프록시 서비스 옵션
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url='
  ];
  
  // 첫 번째 프록시 선택 (다른 프록시로 시도하려면 인덱스 변경)
  const proxyUrl = corsProxies[0] + encodeURIComponent(url);
  
  try {
    const response = await fetch(proxyUrl, options);
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('CORS 프록시 오류:', error);
    throw error;
  }
};

/**
 * 공개 CORS 프록시 중에서 선택하여 사용하는 함수
 * 
 * @param {number} proxyIndex - 사용할 프록시 인덱스 (0-2)
 * @returns {Function} - 설정된 프록시로 fetch를 수행하는 함수
 */
export const selectCorsProxy = (proxyIndex = 0) => {
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url='
  ];
  
  const selectedProxy = corsProxies[proxyIndex] || corsProxies[0];
  
  return async (url, options = {}) => {
    const proxyUrl = selectedProxy + encodeURIComponent(url);
    
    try {
      const response = await fetch(proxyUrl, options);
      
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`CORS 프록시(${selectedProxy}) 오류:`, error);
      throw error;
    }
  };
}; 