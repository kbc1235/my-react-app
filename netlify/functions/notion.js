/* eslint-disable no-undef */
const axios = require('axios');

// 환경 변수에서 Notion API 키를 가져옵니다
const NOTION_API_KEY = process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY;
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

  // API 키 확인
  if (!NOTION_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Notion API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.' })
    };
  }

  try {
    // URL 경로에서 Notion API 엔드포인트 추출
    const path = event.path.replace('/.netlify/functions/notion', '');
    
    // Notion API 요청 URL 구성
    const notionUrl = path ? `${NOTION_API_URL}${path}` : NOTION_API_URL;
    
    // 요청 메서드 및 바디 설정
    const method = event.httpMethod;
    let body;
    
    try {
      body = event.body ? JSON.parse(event.body) : undefined;
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '잘못된 JSON 요청 형식입니다.' })
      };
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
    // 에러 응답 반환
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data || { message: error.message }
      })
    };
  }
}; 