import { useState, useEffect } from 'react';
import { fetchNotionDatabase } from '../services/notionService';
import { fetchNotionDatabaseWithProxy } from '../services/notionCorsProxyService';

function NotionDataTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingProxy, setUsingProxy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result;
        
        try {
          // 먼저 Vite 프록시 방식 시도
          result = await fetchNotionDatabase();
          setUsingProxy(false);
        } catch (proxyError) {
          console.error('Vite 프록시 방식 실패, CORS 프록시로 시도합니다:', proxyError);
          
          // Vite 프록시 실패 시 CORS 프록시 방식 시도
          result = await fetchNotionDatabaseWithProxy();
          setUsingProxy(true);
        }
        
        setData(result);
        console.log('Notion 데이터:', result);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 페이지 속성 추출 함수 (예시)
  const extractProperty = (page, propertyName) => {
    const property = page.properties[propertyName];
    if (!property) return 'N/A';

    switch (property.type) {
      case 'title':
        return property.title.map(t => t.plain_text).join('');
      case 'rich_text':
        return property.rich_text.map(t => t.plain_text).join('');
      case 'number':
        return property.number || 0;
      case 'select':
        return property.select?.name || 'N/A';
      case 'multi_select':
        return property.multi_select?.map(item => item.name).join(', ') || 'N/A';
      case 'date':
        return property.date?.start || 'N/A';
      case 'checkbox':
        return property.checkbox ? '✅' : '❌';
      default:
        return 'N/A';
    }
  };

  if (loading) return <div className="loading">데이터를 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (data.length === 0) return <div className="no-data">데이터가 없습니다.</div>;

  // 모든 속성 키 추출 (첫 번째 항목 기준)
  const propertyKeys = data.length > 0 ? Object.keys(data[0].properties) : [];

  return (
    <div className="notion-data-container">
      <h2>Notion 데이터</h2>
      {usingProxy && (
        <div className="proxy-notice">
          CORS 프록시를 사용하여 데이터를 불러왔습니다.
        </div>
      )}
      <div className="table-container">
        <table className="notion-table">
          <thead>
            <tr>
              {propertyKeys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((page) => (
              <tr key={page.id}>
                {propertyKeys.map((key) => (
                  <td key={`${page.id}-${key}`}>
                    {extractProperty(page, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NotionDataTable; 