/* eslint-disable no-undef */
const axios = require('axios');

// 환경 변수에서 Notion API 키를 가져옵니다 - 여러 환경 변수 접근 방식 시도
let NOTION_API_KEY = process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY;
const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_URL = 'https://api.notion.com/v1';

/**
 * Netlify 서버리스 함수 핸들러
 * Notion API로의 요청을 프록시합니다
 */
exports.handler = async function(event) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*', // 프로덕션에서는 특정 도메인으로 제한하세요
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  // 서버리스 함수 환경의 모든 환경 변수 로깅 (디버깅용)
  console.log('모든 환경 변수 키 목록:', Object.keys(process.env));
  console.log('환경 변수 존재 여부:', {
    'NOTION_API_KEY 존재': !!process.env.NOTION_API_KEY,
    'VITE_NOTION_API_KEY 존재': !!process.env.VITE_NOTION_API_KEY,
    'NETLIFY 존재': !!process.env.NETLIFY,
    'NODE_ENV 존재': !!process.env.NODE_ENV,
    'NODE_ENV 값': process.env.NODE_ENV
  });

  // 디버깅 정보 로깅
  console.log('이벤트 정보:', {
    경로: event.path,
    메서드: event.httpMethod,
    헤더: event.headers,
    바디_길이: event.body ? event.body.length : 0
  });
  console.log('환경 변수:', {
    NOTION_API_KEY_존재: !!NOTION_API_KEY,
    NOTION_API_KEY_길이: NOTION_API_KEY ? NOTION_API_KEY.length : 0
  });

  try {
    // URL 경로에서 Notion API 엔드포인트 추출
    const path = event.path.replace('/.netlify/functions/notion', '');
    
    // Notion API 요청 URL 구성
    const notionUrl = path ? `${NOTION_API_URL}${path}` : NOTION_API_URL;
    
    console.log('Notion API 요청 URL:', notionUrl);
    
    // 요청 메서드 및 바디 설정
    const method = event.httpMethod;
    let body;
    
    try {
      body = event.body ? JSON.parse(event.body) : undefined;
    } catch (parseError) {
      console.error('요청 바디 파싱 오류:', parseError);
      body = undefined;
    }
    
    // API 키가 없는 경우 오류 반환
    if (!NOTION_API_KEY) {
      console.error('Notion API 키가 설정되지 않았습니다.');
      
      // API 키 대체 방법 시도
      let hardcodedApiKey = null;
      try {
        // 요청 바디에서 API 키 찾기 시도 (디버깅 목적)
        if (body && body.apiKey) {
          hardcodedApiKey = body.apiKey;
          console.log('요청 바디에서 API 키 발견');
        }
      } catch (e) {
        console.error('대체 API 키 찾기 실패:', e);
      }
      
      if (!hardcodedApiKey) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Notion API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.',
            envKeys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')).join(', '),
            hasNotionEnvVar: !!process.env.NOTION_API_KEY,
            hasViteNotionEnvVar: !!process.env.VITE_NOTION_API_KEY
          })
        };
      }
      
      // 하드코딩된 키 사용 (임시 디버깅용)
      console.log('하드코딩된 키 사용 시도 (임시)');
      NOTION_API_KEY = hardcodedApiKey;
    }
    
    // Notion API로 요청 전송
    const response = await axios({
      method,
      url: notionUrl,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      data: body
    });
    
    // 성공적인 응답 반환
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    // 에러 정보 로깅
    console.error('Notion API 요청 중 오류 발생:', error);
    console.error('에러 세부 정보:', {
      메시지: error.message,
      응답_상태: error.response?.status,
      응답_데이터: error.response?.data
    });
    
    // 에러 응답 반환
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data || error.message,
        errorMessage: error.message
      })
    };
  }
}; 