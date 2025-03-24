import { fetchWithCorsProxy } from '../utils/corsProxy';

// Notion API 키 가져오기
const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;
const NOTION_API_URL = 'https://api.notion.com/v1';

/**
 * Notion 데이터베이스에서 데이터를 가져오는 함수 (CORS 프록시 사용)
 */
export const fetchNotionDatabaseWithProxy = async () => {
  try {
    // CORS 프록시 사용 방식
    const response = await fetchWithCorsProxy(
      `${NOTION_API_URL}/databases/${DATABASE_ID}/query`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({}),
      }
    );
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Notion 데이터베이스 조회 오류 (프록시):', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스에 새 항목을 추가하는 함수 (CORS 프록시 사용)
 * @param {Object} data - 데이터베이스에 추가할 데이터
 */
export const addNotionDatabaseItemWithProxy = async (data) => {
  try {
    // CORS 프록시 사용 방식
    const response = await fetchWithCorsProxy(
      `${NOTION_API_URL}/pages`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: {
            database_id: DATABASE_ID,
          },
          properties: data,
        }),
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Notion 데이터베이스 항목 추가 오류 (프록시):', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스의 항목을 업데이트하는 함수 (CORS 프록시 사용)
 * @param {string} pageId - 업데이트할 페이지 ID
 * @param {Object} data - 업데이트할 데이터
 */
export const updateNotionDatabaseItemWithProxy = async (pageId, data) => {
  try {
    // CORS 프록시 사용 방식
    const response = await fetchWithCorsProxy(
      `${NOTION_API_URL}/pages/${pageId}`, 
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: data,
        }),
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Notion 데이터베이스 항목 업데이트 오류 (프록시):', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스의 항목을 삭제하는 함수 (CORS 프록시 사용)
 * @param {string} pageId - 삭제할 페이지 ID
 */
export const deleteNotionDatabaseItemWithProxy = async (pageId) => {
  try {
    // CORS 프록시 사용 방식
    const response = await fetchWithCorsProxy(
      `${NOTION_API_URL}/pages/${pageId}`, 
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          archived: true,
        }),
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Notion 데이터베이스 항목 삭제 오류 (프록시):', error);
    throw error;
  }
}; 