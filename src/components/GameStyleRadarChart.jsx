import { useState, useEffect, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { fetchNotionDatabase } from '../services/notionService';
import { fetchNotionDatabaseWithProxy } from '../services/notionCorsProxyService';
import '../styles/GameStyleRadarChart.css';

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 게임 관련 스탯 이름 매핑
const STAT_NAMES = {
  'title': '캐릭터명',
  'number': '수치',
  'date': '날짜',
  'select': '선택',
  'multi_select': '다중선택',
  'checkbox': '체크박스',
  'Name': '이름',
  'Tags': '태그',
  'Status': '상태',
  // 게임 스탯 이름
  'STR': '힘',
  'DEX': '민첩',
  'CON': '체력',
  'INT': '지능',
  'WIS': '지혜',
  'CHA': '매력',
  'HP': '체력',
  'MP': '마력',
  'Attack': '공격력',
  'Defense': '방어력',
  'Speed': '속도',
  'Magic': '마법력',
  'Luck': '행운',
};

// 스탯 이름 변환 함수
const translateStatName = (name) => {
  return STAT_NAMES[name] || name;
};

function GameStyleRadarChart() {
  const [notionData, setNotionData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [level, setLevel] = useState(1);
  const [characterName, setCharacterName] = useState('용사');
  const [characterClass, setCharacterClass] = useState('전사');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingProxy, setUsingProxy] = useState(false);
  const [statPoints, setStatPoints] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isCharacterListOpen, setIsCharacterListOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let result;
        
        try {
          // 먼저 Vite 프록시 방식 시도
          result = await fetchNotionDatabase();
          setUsingProxy(false);
        } catch (proxyError) {
          console.error('Vite 프록시 방식 실패, CORS 프록시로 시도합니다:', proxyError);
          
          try {
            // Vite 프록시 실패 시 CORS 프록시 방식 시도
            result = await fetchNotionDatabaseWithProxy();
            setUsingProxy(true);
          } catch (corsError) {
            console.error('CORS 프록시 방식도 실패:', corsError);
            throw new Error('API 연결에 실패했습니다 (CORS 오류)');
          }
        }
        
        // 결과 유효성 검사
        if (!result || !Array.isArray(result) || result.length === 0) {
          console.warn('Notion에서 가져온 데이터가 비어 있습니다:', result);
          setError('Notion에서 데이터를 찾을 수 없습니다.');
          setNotionData([]);
          return;
        }
        
        // 전체 데이터 저장
        setNotionData(result);
        console.log('Notion 데이터 로드 완료, 항목 수:', result.length);
        
        // 첫 번째 항목 처리
        updateSelectedCharacter(result, 0);
        
      } catch (err) {
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
        console.error('데이터 로딩 오류:', err);
        setNotionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 외부 클릭 감지 이벤트 리스너
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsCharacterListOpen(false);
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener('mousedown', handleOutsideClick);
    
    // 클린업 함수
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // 선택된 캐릭터 업데이트 함수
  const updateSelectedCharacter = (data, index) => {
    // 데이터 검증
    if (!data || !Array.isArray(data) || index < 0 || index >= data.length) {
      console.error('유효하지 않은 데이터 또는 인덱스:', { dataLength: data?.length, index });
      setError('선택한 캐릭터 데이터를 찾을 수 없습니다.');
      return;
    }

    const item = data[index];
    
    // ID 검증
    if (!item || !item.id) {
      console.error('유효하지 않은 항목 데이터:', item);
      setError('선택한 캐릭터의 데이터가 유효하지 않습니다.');
      return;
    }
    
    console.log('캐릭터 데이터 업데이트 시작:', { id: item.id, index });
    
    // 차트 데이터 변환
    const transformedData = transformDataForGameChart(item);
    setChartData(transformedData.chartData);
    
    // 캐릭터 이름 추출 시도
    let name = `캐릭터 #${index + 1}`;
    const titleProp = Object.values(item.properties).find(prop => prop.type === 'title');
    if (titleProp && titleProp.title && titleProp.title.length > 0) {
      name = titleProp.title.map(t => t.plain_text).join('');
      name = name.trim() || name; // 빈 문자열이면 기본값 유지
    }
    setCharacterName(name);
    
    // 레벨 랜덤 설정
    setLevel(Math.floor(Math.random() * 50) + 1);
    
    // 클래스 설정
    const classes = ['전사', '마법사', '궁수', '도적', '성직자', '드루이드', '바드'];
    setCharacterClass(classes[Math.floor(Math.random() * classes.length)]);
    
    // 스탯 포인트 설정
    setStatPoints(transformedData.statPoints);
    
    console.log('캐릭터 데이터 업데이트 완료:', name);
  };

  // 검색어를 기준으로 필터링된 캐릭터 목록
  const filteredCharacters = notionData.filter(item => {
    const characterName = getCharacterName(item);
    return characterName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 캐릭터 선택 핸들러
  const handleCharacterSelect = (index) => {
    // 필터링된 목록에서 실제 원본 데이터의 인덱스를 찾음
    const selectedItem = filteredCharacters[index];
    const originalIndex = notionData.findIndex(item => item.id === selectedItem.id);
    
    console.log('선택된 항목:', {
      index: index,  // 필터링된 목록에서의 인덱스
      filteredItem: selectedItem,  // 필터링된 목록에서 선택된 항목
      originalIndex: originalIndex,  // 원본 데이터에서의 인덱스
      originalItem: notionData[originalIndex]  // 원본 데이터에서의 항목
    });
    
    // 원본 데이터의 인덱스를 저장
    setSelectedIndex(originalIndex);
    
    // 선택된 캐릭터 데이터 업데이트
    updateSelectedCharacter(notionData, originalIndex);
    
    // 모바일에서 사이드바 닫기
    setIsCharacterListOpen(false);
  };

  // 사이드바 토글 핸들러
  const toggleCharacterList = () => {
    setIsCharacterListOpen(!isCharacterListOpen);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 캐릭터 목록에서 이름 표시용 함수
  const getCharacterName = (item, index) => {
    const titleProp = Object.values(item.properties).find(prop => prop.type === 'title');
    if (titleProp && titleProp.title.length > 0) {
      return titleProp.title.map(t => t.plain_text).join('');
    }
    return index !== undefined ? `캐릭터 #${index + 1}` : '이름 없음';
  };

  // Notion 데이터를 게임 스타일 차트 데이터로 변환하는 함수
  const transformDataForGameChart = (item) => {
    if (!item) {
      return { chartData: null, statPoints: {} };
    }

    const labels = [];
    const dataValues = [];
    const statPoints = {}; // 각 스탯의 포인트

    // 속성을 반복하여 숫자 값만 추출
    Object.entries(item.properties).forEach(([key, property]) => {
      // 숫자 타입 속성 또는 변환 가능한 속성만 추출
      if (property.type === 'number' || property.number !== undefined) {
        const label = translateStatName(key);
        labels.push(label);
        const value = property.number || 0;
        dataValues.push(value);
        
        // 스탯 포인트 저장
        statPoints[label] = {
          value,
          max: 100
        };
      }
    });

    // 데이터가 부족한 경우 게임 스탯 추가
    if (labels.length < 6) {
      const gameStats = ['힘', '민첩', '체력', '지능', '지혜', '매력'];
      const existingCount = labels.length;
      
      for (let i = 0; i < Math.min(6 - existingCount, gameStats.length); i++) {
        const label = gameStats[i];
        labels.push(label);
        const value = Math.floor(Math.random() * 70) + 30; // 30-100 사이의 랜덤 값
        dataValues.push(value);
        
        // 스탯 포인트 저장
        statPoints[label] = {
          value,
          max: 100
        };
      }
    }

    return {
      chartData: {
        labels,
        datasets: [
          {
            label: '캐릭터 스탯',
            data: dataValues,
            backgroundColor: 'rgba(75, 217, 251, 0.5)',
            borderColor: 'rgba(75, 217, 251, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(255, 206, 86, 1)',
            pointBorderColor: '#000',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 206, 86, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ],
      },
      statPoints
    };
  };

  // 차트 옵션 설정
  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(75, 217, 251, 0.2)',
        },
        grid: {
          color: 'rgba(75, 217, 251, 0.2)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          backdropColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.8)',
          z: 1,
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: '"Noto Sans KR", sans-serif',
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: '"Noto Sans KR", sans-serif',
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: '"Noto Sans KR", sans-serif',
          size: 12
        },
        bodyFont: {
          family: '"Noto Sans KR", sans-serif',
          size: 12
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // 로딩 및 에러 화면
  if (loading) return <div className="game-loading">데이터 로딩 중...</div>;
  if (error) return <div className="game-error">데이터 불러오기 실패!</div>;
  if (!chartData) return <div className="game-no-data">캐릭터 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="game-chart-container">
      {/* 메인 컨텐츠 영역 */}
      <div className="game-main-content">
        <div className="game-character-info">
          <div className="character-portrait"></div>
          <div className="character-details">
            <h2>{characterName} <span className="character-level">Lv.{level}</span></h2>
            <p className="character-class">{characterClass}</p>
            
            <button 
              className="character-select-button" 
              onClick={toggleCharacterList}
            >
              {isCharacterListOpen ? '목록 닫기' : '캐릭터 목록 보기'}
            </button>
          </div>
        </div>
        
        {usingProxy && (
          <div className="game-notice">
            CORS 프록시를 통해 데이터를 불러왔습니다.
          </div>
        )}
        
        <div className="game-chart-wrapper">
          <Radar data={chartData} options={chartOptions} />
        </div>
        
        <div className="game-stats-container">
          <h3>스탯 정보</h3>
          <div className="game-stats-grid">
            {Object.entries(statPoints).map(([stat, data]) => (
              <div key={stat} className="stat-item">
                <div className="stat-name">{stat}</div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar" 
                    style={{width: `${(data.value / data.max) * 100}%`}}
                  ></div>
                </div>
                <div className="stat-value">{data.value}/{data.max}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 오른쪽 사이드바 - 캐릭터 선택 */}
      <div ref={sidebarRef} className={`character-sidebar ${isCharacterListOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>캐릭터 목록</h3>
          <button onClick={() => setIsCharacterListOpen(false)} className="close-sidebar-button">×</button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="캐릭터 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="character-search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-button" 
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
        
        <div className="character-list">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((item, index) => (
              <div 
                key={item.id} 
                className={`character-list-item ${notionData[selectedIndex]?.id === item.id ? 'selected' : ''}`}
                onClick={() => handleCharacterSelect(index)}
              >
                <span className="character-list-name">{getCharacterName(item, index)}</span>
              </div>
            ))
          ) : (
            <div className="no-search-results">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
      
      {/* 모바일용 오버레이 */}
      {isCharacterListOpen && <div className="sidebar-overlay" onClick={() => setIsCharacterListOpen(false)}></div>}
    </div>
  );
}

export default GameStyleRadarChart; 