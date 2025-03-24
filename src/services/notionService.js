// 환경 변수 및 API 유틸리티 함수 임포트
import { notionApiRequest } from '../utils/apiUtils';

// Notion API 키 가져오기
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

/**
 * Notion 데이터베이스에서 데이터를 가져오는 함수
 */
export const fetchNotionDatabase = async () => {
  try {
    // 환경에 맞는 API 호출 (apiUtils 사용)
    const response = await notionApiRequest(`/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Notion 데이터베이스 조회 오류:', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스에 새 항목을 추가하는 함수
 * @param {Object} data - 데이터베이스에 추가할 데이터
 */
export const addNotionDatabaseItem = async (data) => {
  try {
    const response = await notionApiRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: {
          database_id: DATABASE_ID,
        },
        properties: data,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Notion 데이터베이스 항목 추가 오류:', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스의 항목을 업데이트하는 함수
 * @param {string} pageId - 업데이트할 페이지 ID
 * @param {Object} data - 업데이트할 데이터
 */
export const updateNotionDatabaseItem = async (pageId, data) => {
  try {
    const response = await notionApiRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: data,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Notion 데이터베이스 항목 업데이트 오류:', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스의 항목을 삭제하는 함수 (아카이브로 표시)
 * @param {string} pageId - 삭제할 페이지 ID
 */
export const deleteNotionDatabaseItem = async (pageId) => {
  try {
    const response = await notionApiRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        archived: true,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Notion 데이터베이스 항목 삭제 오류:', error);
    throw error;
  }
};

/**
 * Notion 페이지에 텍스트 내용을 추가합니다.
 * @param {string} pageId Notion 페이지 ID
 * @param {string} content 추가할 내용
 * @returns {Promise} API 응답
 */
export const addContentToPage = async (pageId, content) => {
  try {
    const response = await notionApiRequest(`/blocks/${pageId}/children`, {
      method: 'POST',
      body: JSON.stringify({
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content,
                  }
                }
              ]
            }
          }
        ]
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Notion API 오류:', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스에 새 항목을 추가합니다.
 * @param {string} databaseId Notion 데이터베이스 ID
 * @param {Object} properties 데이터베이스 속성 (데이터베이스 구조에 맞게 설정)
 * @returns {Promise} API 응답
 */
export const addItemToDatabase = async (databaseId, properties) => {
  try {
    const response = await notionApiRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: {
          database_id: databaseId,
        },
        properties,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Notion API 오류:', error);
    throw error;
  }
};

/**
 * Notion 페이지의 특정 속성을 업데이트합니다.
 * @param {string} pageId Notion 페이지 ID
 * @param {string} propertyName 업데이트할 속성 이름
 * @param {any} propertyValue 업데이트할 속성 값
 * @param {string} propertyType 속성 타입 (text, number, select 등)
 * @returns {Promise} API 응답
 */
export const updatePageProperty = async (pageId, propertyName, propertyValue, propertyType = 'rich_text') => {
  try {
    let propertyData = {};

    // 속성 타입에 따라 다른 형식의 데이터 구성
    switch (propertyType) {
      case 'rich_text':
        propertyData = {
          rich_text: [
            {
              type: 'text',
              text: {
                content: propertyValue,
              },
            },
          ],
        };
        break;
      case 'title':
        propertyData = {
          title: [
            {
              type: 'text',
              text: {
                content: propertyValue,
              },
            },
          ],
        };
        break;
      case 'number':
        propertyData = {
          number: parseFloat(propertyValue),
        };
        break;
      case 'select':
        propertyData = {
          select: {
            name: propertyValue,
          },
        };
        break;
      default:
        throw new Error(`지원하지 않는 속성 타입: ${propertyType}`);
    }

    const response = await notionApiRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: {
          [propertyName]: propertyData,
        },
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Notion 페이지 속성 업데이트 오류:', error);
    throw error;
  }
}; 