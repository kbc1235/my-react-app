// Notion API 키 가져오기
const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

/**
 * Notion 데이터베이스에서 데이터를 가져오는 함수
 */
export const fetchNotionDatabase = async () => {
  try {
    // Netlify Functions 사용 방식으로 변경 - CORS 오류 해결
    const response = await fetch('/.netlify/functions/notion/databases/' + DATABASE_ID + '/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
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
    // Netlify Functions 사용 방식으로 변경
    const response = await fetch('/.netlify/functions/notion/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: {
          database_id: DATABASE_ID,
        },
        properties: data,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
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
    // Netlify Functions 사용 방식으로 변경
    const response = await fetch(`/.netlify/functions/notion/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: data,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
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
    // Netlify Functions 사용 방식으로 변경
    const response = await fetch(`/.netlify/functions/notion/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        archived: true,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
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
    // Netlify Functions 사용 방식으로 변경 - CORS 오류 해결
    const response = await fetch(`/.netlify/functions/notion/blocks/${pageId}/children`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
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
    // Netlify Functions 사용 방식으로 변경 - CORS 오류 해결
    const response = await fetch('/.netlify/functions/notion/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId,
        },
        properties,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Notion API 오류:', error);
    throw error;
  }
}; 