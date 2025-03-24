/**
 * 이 파일은 백엔드 없이 작업할 때 참고용으로 제공되는 서비스 파일입니다.
 * 실제로 사용하려면 서버리스 함수를 배포하고 해당 URL로 변경해야 합니다.
 * 현재는 Notion API의 CORS 정책으로 인해 직접 호출하면 오류가 발생할 수 있습니다.
 */

const API_BASE_URL = '/api/notion'; // 프록시 URL을 사용하거나 서버리스 함수 URL로 변경

/**
 * Notion 데이터베이스에서 데이터를 가져오는 함수
 */
export const fetchNotionDatabaseServerless = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/databases`);
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Notion 데이터베이스 조회 오류:', error);
    throw error;
  }
};

/**
 * Notion 데이터베이스에 새 항목을 추가하는 함수
 * @param {Object} data - 데이터베이스에 추가할 데이터
 */
export const addNotionItemServerless = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
export const updateNotionItemServerless = async (pageId, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: pageId, properties: data }),
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
export const deleteNotionItemServerless = async (pageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: pageId }),
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