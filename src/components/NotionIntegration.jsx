import { useState, useEffect } from 'react';
import { addContentToPage, addItemToDatabase, fetchNotionDatabase } from '../services/notionService';
import './NotionIntegration.css';

function NotionIntegration() {
  const [input, setInput] = useState('');
  const [pageId, setPageId] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [databaseProperties, setDatabaseProperties] = useState({});
  const [selectedTitleProperty, setSelectedTitleProperty] = useState('');
  const [selectedContentProperty, setSelectedContentProperty] = useState('');
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [useStructuredData, setUseStructuredData] = useState(true);
  
  // 테이블 형식 입력을 위한 상태
  const [tableMode, setTableMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [exerciseValues, setExerciseValues] = useState({
    benchpress: '',
    deadlift: '',
    squat: '',
    clean: '',
    jerk: '',
    snatch: ''
  });
  // 메모를 위한 상태 추가
  const [memo, setMemo] = useState('');

  // 운동 기록 템플릿 추가
//   const addWorkoutTemplate = () => {
//     const workoutTemplate = `# 운동 기록

// | 운동 | 기록 |
// | --- | --- |
// | # benchpress | |
// | # clean | |
// | # deadlift | |
// | # jerk | |
// | # snatch | |
// | # squat | |

// ## 메모

// `;
//     setInput(workoutTemplate);
//     setTableMode(false);
//   };

//   // 빈 운동 기록 템플릿 추가
//   const addEmptyWorkoutTemplate = () => {
//     const emptyWorkoutTemplate = `# 운동 기록

// | 운동 | 기록 |
// | --- | --- |
// | # benchpress | Empty |
// | # clean | Empty |
// | # deadlift | Empty |
// | # jerk | Empty |
// | # snatch | Empty |
// | # squat | Empty |

// ## 메모

// `;
//     setInput(emptyWorkoutTemplate);
//     setTableMode(false);
//   };

  // 테이블 모드 활성화
  const enableTableMode = () => {
    setTableMode(true);
    setUseStructuredData(true);
  };

  // 운동 값 업데이트 핸들러
  const handleExerciseValueChange = (exercise, value) => {
    setExerciseValues(prev => ({
      ...prev,
      [exercise]: value
    }));
  };

  useEffect(() => {
    // 기본 데이터베이스 ID가 있으면 해당 데이터베이스의 속성 정보를 가져옵니다
    const defaultDatabaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
    if (defaultDatabaseId) {
      setDatabaseId(defaultDatabaseId);
      loadDatabaseProperties();
    }
  }, []);

  // 데이터베이스 ID가 변경되면 데이터베이스 속성 정보를 가져옵니다
  useEffect(() => {
    if (databaseId) {
      loadDatabaseProperties();
    }
  }, [databaseId]);

  // 데이터베이스 속성 정보를 가져오는 함수
  const loadDatabaseProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 데이터베이스에서 첫 번째 항목을 가져옵니다
      const results = await fetchNotionDatabase();
      
      if (results && results.length > 0) {
        // 첫 번째 항목의 속성 구조를 확인합니다
        const firstItem = results[0];
        const properties = firstItem.properties;
        
        // 사용 가능한 속성 목록을 생성합니다
        const options = [];
        const propertiesMap = {};
        
        // 각 속성의 유형을 확인합니다
        Object.entries(properties).forEach(([key, value]) => {
          propertiesMap[key] = value.type;
          options.push({
            name: key,
            type: value.type
          });
        });
        
        setDatabaseProperties(propertiesMap);
        setPropertyOptions(options);
        
        // 타이틀 유형의 속성을 기본으로 선택합니다
        const titleProperty = options.find(prop => prop.type === 'title');
        if (titleProperty) {
          setSelectedTitleProperty(titleProperty.name);
        }
        
        // 리치 텍스트 유형의 속성을 기본으로 선택합니다
        const textProperty = options.find(prop => prop.type === 'rich_text');
        if (textProperty) {
          setSelectedContentProperty(textProperty.name);
        }
      }
    } catch (err) {
      setError('데이터베이스 속성 정보를 가져오는 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 운동 데이터 파싱 함수 (테이블 형식)
  const parseWorkoutData = (text) => {
    const workoutData = {};
    
    // 정규식을 사용하여 테이블 행 추출
    const regex = /\| # (\w+) \| (.*?) \|/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const exercise = match[1];
      const record = match[2].trim();
      workoutData[exercise] = record === '' ? 'Empty' : record;
    }
    
    return workoutData;
  };

  // 페이지에 내용 추가
  const handleAddToPage = async (e) => {
    e.preventDefault();
    if (!pageId.trim() || !input.trim()) {
      setError('페이지 ID와 내용을 모두 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await addContentToPage(pageId, input);
      setResult({
        success: true,
        message: '내용이 Notion 페이지에 성공적으로 추가되었습니다',
        data: response
      });
    } catch (err) {
      setError(err.message || '내용 추가 중 오류가 발생했습니다');
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  // 데이터베이스에 항목 추가
  const handleAddToDatabase = async (e) => {
    e.preventDefault();
    if (!databaseId.trim() || !input.trim()) {
      setError('데이터베이스 ID와 내용을 모두 입력해주세요');
      return;
    }

    if (!selectedTitleProperty) {
      setError('제목으로 사용할 속성을 선택해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // 선택된 속성에 맞게 properties 객체를 만듭니다
      const properties = {};
      
      // 제목 속성 설정
      if (selectedTitleProperty) {
        properties[selectedTitleProperty] = {
          title: [
            {
              text: {
                content: `운동 기록 ${new Date().toLocaleString()}`
              }
            }
          ]
        };
      }
      
      // 구조화된 데이터 사용 설정이 켜져 있는 경우
      if (useStructuredData) {
        const workoutData = parseWorkoutData(input);
        
        // 파싱된 운동 데이터를 속성에 추가
        Object.entries(workoutData).forEach(([exercise, record]) => {
          // 해당 운동 이름의 속성이 있는지 확인
          if (databaseProperties[exercise]) {
            const type = databaseProperties[exercise];
            
            // 속성 유형에 따라 적절한 값 설정
            if (type === 'rich_text') {
              properties[exercise] = {
                rich_text: [
                  {
                    text: {
                      content: record
                    }
                  }
                ]
              };
            } else if (type === 'text') {
              properties[exercise] = {
                text: {
                  content: record
                }
              };
            } else if (type === 'number' && record !== 'Empty') {
              // 숫자 값으로 변환 시도
              const numericValue = parseFloat(record);
              if (!isNaN(numericValue)) {
                properties[exercise] = {
                  number: numericValue
                };
              }
            }
          }
        });
      }
      
      // 내용 속성 설정 (구조화된 데이터를 사용하더라도 전체 내용도 저장)
      if (selectedContentProperty) {
        const type = databaseProperties[selectedContentProperty];
        if (type === 'rich_text') {
          properties[selectedContentProperty] = {
            rich_text: [
              {
                text: {
                  content: input
                }
              }
            ]
          };
        } else if (type === 'text') {
          properties[selectedContentProperty] = {
            text: {
              content: input
            }
          };
        }
      }
      
      const response = await addItemToDatabase(databaseId, properties);
      setResult({
        success: true,
        message: '항목이 Notion 데이터베이스에 성공적으로 추가되었습니다',
        data: response
      });
    } catch (err) {
      setError(err.message || '항목 추가 중 오류가 발생했습니다');
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 모드에서 데이터베이스에 항목 추가
  const handleAddTableToDatabase = async (e) => {
    e.preventDefault();
    if (!databaseId.trim()) {
      setError('데이터베이스 ID를 입력해주세요');
      return;
    }

    if (!selectedTitleProperty) {
      setError('제목으로 사용할 속성을 선택해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // 속성 객체 초기화
      const properties = {};
      
      // 이름(제목) 속성 설정
      if (selectedTitleProperty) {
        properties[selectedTitleProperty] = {
          title: [
            {
              text: {
                content: userName || `사용자 ${new Date().toLocaleString()}`
              }
            }
          ]
        };
      }
      
      // 각 운동별 수치 설정
      Object.entries(exerciseValues).forEach(([exercise, value]) => {
        if (databaseProperties[exercise]) {
          const type = databaseProperties[exercise];
          
          if (type === 'number' && value !== '') {
            // 숫자 값으로 변환
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
              properties[exercise] = {
                number: numericValue
              };
            }
          } else if (type === 'rich_text' || type === 'text') {
            properties[exercise] = {
              rich_text: [
                {
                  text: {
                    content: value === '' ? 'Empty' : value
                  }
                }
              ]
            };
          }
        }
      });
      
      // 메모 속성 추가 (만약 memo 속성이 데이터베이스에 있다면)
      if (databaseProperties['dec']) {
        const type = databaseProperties['dec'];
        if (type === 'rich_text' || type === 'text') {
          properties['dec'] = {
            rich_text: [
              {
                text: {
                  content: memo
                }
              }
            ]
          };
        }
      }
      
      const response = await addItemToDatabase(databaseId, properties);
      setResult({
        success: true,
        message: '운동 기록이 Notion 데이터베이스에 성공적으로 추가되었습니다',
        data: response
      });
      
      // 입력 필드 초기화
      setUserName('');
      setExerciseValues({
        benchpress: '',
        deadlift: '',
        squat: '',
        clean: '',
        jerk: '',
        snatch: ''
      });
      setMemo(''); // 메모 초기화 추가
    } catch (err) {
      setError(err.message || '항목 추가 중 오류가 발생했습니다');
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notion-integration">
      <h2>Notion에 저장하기</h2>
      
      <div className="template-buttons">
        {/* <button 
          onClick={addWorkoutTemplate}
          className="template-button"
        >
          운동 기록 템플릿 추가
        </button>
        <button 
          onClick={addEmptyWorkoutTemplate}
          className="template-button"
        >
          빈 운동 기록 템플릿 추가
        </button> */}
        <button 
          onClick={enableTableMode}
          className="template-button table-mode-button"
        >
          테이블 모드 활성화
        </button>
      </div>
      
      {!tableMode ? (
        // 기존 텍스트 입력 모드
        <div className="input-container">
          <label htmlFor="gpt-input">GPT 응답 내용:</label>
          <textarea
            id="gpt-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Notion에 저장할 GPT 응답 내용을 입력하세요"
            rows={10}
          />
        </div>
      ) : (
        // 테이블 모드 입력 폼
        <div className="table-input-container">
          <h3>테이블 모드 - 운동 기록 입력</h3>
          
          <div className="input-row">
            <label htmlFor="user-name">이름:</label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="사용자 이름"
            />
          </div>
          
          <div className="exercise-grid">
            {Object.keys(exerciseValues).map(exercise => (
              <div key={exercise} className="exercise-input">
                <label htmlFor={`exercise-${exercise}`}>{exercise}:</label>
                <input
                  id={`exercise-${exercise}`}
                  type="number"
                  value={exerciseValues[exercise]}
                  onChange={(e) => handleExerciseValueChange(exercise, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          
          {/* 메모 입력 영역 추가 */}
          <div className="memo-container">
            <label htmlFor="workout-memo">메모:</label>
            <textarea
              id="workout-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="운동에 대한 메모를 입력하세요"
              rows={4}
            />
          </div>
        </div>
      )}
      
      <div className="page-section">
        <h3>Notion 페이지에 추가</h3>
        <div className="input-row">
          <label htmlFor="page-id">Notion 페이지 ID:</label>
          <input
            id="page-id"
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <button 
          onClick={handleAddToPage}
          disabled={loading}
        >
          {loading ? '처리 중...' : '페이지에 추가'}
        </button>
      </div>
      
      <div className="database-section">
        <h3>Notion 데이터베이스에 추가</h3>
        <div className="input-row">
          <label htmlFor="database-id">Notion 데이터베이스 ID:</label>
          <input
            id="database-id"
            type="text"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        
        {propertyOptions.length > 0 && (
          <>
            <div className="input-row">
              <label htmlFor="title-property">제목(이름) 속성 선택:</label>
              <select
                id="title-property"
                value={selectedTitleProperty}
                onChange={(e) => setSelectedTitleProperty(e.target.value)}
              >
                <option value="">-- 선택하세요 --</option>
                {propertyOptions
                  .filter(prop => prop.type === 'title')
                  .map(prop => (
                    <option key={prop.name} value={prop.name}>
                      {prop.name}
                    </option>
                  ))
                }
              </select>
            </div>
            
            {!tableMode && (
              <>
                <div className="input-row">
                  <label htmlFor="content-property">내용 속성 선택:</label>
                  <select
                    id="content-property"
                    value={selectedContentProperty}
                    onChange={(e) => setSelectedContentProperty(e.target.value)}
                  >
                    <option value="">-- 선택하세요 --</option>
                    {propertyOptions
                      .filter(prop => ['rich_text', 'text'].includes(prop.type))
                      .map(prop => (
                        <option key={prop.name} value={prop.name}>
                          {prop.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="input-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={useStructuredData}
                      onChange={(e) => setUseStructuredData(e.target.checked)}
                    />
                    운동 데이터를 개별 속성으로 저장 (DB에 각 운동명 속성 필요)
                  </label>
                </div>
              </>
            )}
          </>
        )}
        
        <button 
          onClick={tableMode ? handleAddTableToDatabase : handleAddToDatabase}
          disabled={loading}
        >
          {loading ? '처리 중...' : '데이터베이스에 추가'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>오류: {error}</p>
        </div>
      )}
      
      {result && result.success && (
        <div className="success-message">
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}

export default NotionIntegration; 