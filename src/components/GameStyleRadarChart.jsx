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
import { fetchNotionDatabase, updatePageProperty } from '../services/notionService';
import { fetchNotionDatabaseWithProxy } from '../services/notionCorsProxyService';
import { getEnvironment } from '../utils/apiUtils';

// Chart.js 컴포넌트 등록은 useEffect 내부로 이동

// 게임 관련 스탯 이름 매핑
const STAT_NAMES = {
  'title': '회원명',
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
  const [environment, setEnvironment] = useState({});
  const [statPoints, setStatPoints] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Chart.js 컴포넌트 등록
  useEffect(() => {
    // 컴포넌트 마운트 시 Chart.js 등록
    ChartJS.register(
      RadialLinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip,
      Legend
    );
    
    // 환경 정보 설정
    setEnvironment(getEnvironment());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let result;
        const env = getEnvironment();
        
        try {
          // 표준 서비스 사용 (로컬/Netlify 환경에 따라 자동 처리)
          result = await fetchNotionDatabase();
          setUsingProxy(false);
        } catch (apiError) {
          console.error('기본 API 호출 실패, CORS 프록시로 시도합니다:', apiError);
          
          // 개발 환경에서만 CORS 프록시 시도
          if (env.isDevelopment) {
            try {
              result = await fetchNotionDatabaseWithProxy();
              setUsingProxy(true);
            } catch (corsError) {
              console.error('CORS 프록시 방식도 실패:', corsError);
              throw new Error('API 연결에 실패했습니다 (CORS 오류)');
            }
          } else {
            // 프로덕션에서는 원래 오류 그대로 발생
            throw apiError;
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
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener('mousedown', handleOutsideClick);
    
    // 클린업 함수
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 선택된 회원 업데이트 함수
  const updateSelectedCharacter = (data, index) => {
    // 데이터 검증
    if (!data || !Array.isArray(data) || index < 0 || index >= data.length) {
      console.error('유효하지 않은 데이터 또는 인덱스:', { dataLength: data?.length, index });
      setError('선택한 회원 데이터를 찾을 수 없습니다.');
      return;
    }

    const item = data[index];
    
    // ID 검증
    if (!item || !item.id) {
      console.error('유효하지 않은 항목 데이터:', item);
      setError('선택한 회원의 데이터가 유효하지 않습니다.');
      return;
    }
    
    console.log('회원 데이터 업데이트 시작:', { id: item.id, index });
    
    try {
      // 차트 데이터 변환
      const transformedData = transformDataForGameChart(item);
      
      // 차트 데이터 유효성 검증
      if (transformedData && 
          transformedData.chartData && 
          transformedData.chartData.labels && 
          transformedData.chartData.datasets && 
          transformedData.chartData.datasets.length > 0 &&
          transformedData.chartData.datasets[0].data) {
        
        // 차트 데이터 업데이트
        setChartData(transformedData.chartData);
        
        // 스탯 포인트 설정
        setStatPoints(transformedData.statPoints || {});
      } else {
        console.error('유효하지 않은 차트 데이터:', transformedData);
        setError('차트 데이터 생성에 실패했습니다.');
        return;
      }
      
      // 회원 이름 추출 시도
      let name = `회원 #${index + 1}`;
      const titleProp = Object.values(item.properties).find(prop => prop.type === 'title');
      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        name = titleProp.title.map(t => t.plain_text).join('');
        name = name.trim() || name; // 빈 문자열이면 기본값 유지
      }
      setCharacterName(name);

      // 설명(dec) 추출 시도
      let desc = '';
      const decProp = Object.entries(item.properties).find(([key]) => key.toLowerCase() === 'dec');
      
      if (decProp && decProp[1].rich_text && decProp[1].rich_text.length > 0) {
        desc = decProp[1].rich_text.map(t => t.plain_text).join('');
      } else if (decProp && decProp[1].type === 'rich_text' && decProp[1].rich_text) {
        desc = decProp[1].rich_text.map(t => t.plain_text).join('');
      }
      
      setDescription(desc);
      setIsEditingDesc(false);
      
      // 레벨 랜덤 설정
      setLevel(Math.floor(Math.random() * 50) + 1);
      
      // 회원 유형형 설정
      const classes = ['직장인 과부화형', ' 육아맘 리커버리형', '바디프로젝트 형', '자기계발형', '공감커뮤니티형', '힐링 중심형'];
      setCharacterClass(classes[Math.floor(Math.random() * classes.length)]);
      
      console.log('회원 데이터 업데이트 완료:', name);
    } catch (error) {
      console.error('회원 데이터 업데이트 중 오류 발생:', error);
      setError(`데이터 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 회원 목록에서 이름 표시용 함수
  const getCharacterName = (item, index) => {
    const titleProp = Object.values(item.properties).find(prop => prop.type === 'title');
    if (titleProp && titleProp.title.length > 0) {
      return titleProp.title.map(t => t.plain_text).join('');
    }
    return index !== undefined ? `회원 #${index + 1}` : '이름 없음';
  };

  // 검색어를 기준으로 필터링된 회원 목록
  const filteredCharacters = notionData.filter(item => {
    const characterName = getCharacterName(item);
    return characterName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 회원 선택 핸들러
  const handleCharacterSelect = (index) => {
    // 필터링된 목록에서 실제 원본 데이터의 인덱스를 찾음
    const selectedItem = filteredCharacters[index];
    const originalIndex = notionData.findIndex(item => item.id === selectedItem.id);
    
    // 원본 데이터의 인덱스를 저장
    setSelectedIndex(originalIndex);
    
    // 선택된 회원 데이터 업데이트
    updateSelectedCharacter(notionData, originalIndex);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 설명 변경 핸들러
  const handleDescChange = (e) => {
    setDescription(e.target.value);
  };

  // 설명 저장 핸들러
  const handleSaveDesc = async () => {
    if (!notionData || notionData.length === 0 || selectedIndex < 0) {
      return;
    }

    try {
      setIsEditingDesc(false);
      
      const pageId = notionData[selectedIndex]?.id;
      if (pageId) {
        // 로딩 표시 등의 UI 업데이트 추가 가능
        console.log('설명 저장 시작:', {
          pageId,
          description
        });
        
        // Notion API를 통해 설명 업데이트
        const result = await updatePageProperty(pageId, 'dec', description);
        console.log('설명 저장 완료:', result);
        
        // 성공 알림 등 추가 가능
      }
    } catch (error) {
      console.error('설명 저장 중 오류:', error);
      // 오류 처리 (알림 등) 추가 가능
    }
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
            label: '회원 스탯',
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
  if (!chartData) return <div className="game-no-data">회원 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="game-chart-container">
      {/* 메인 컨텐츠 영역 */}
      <div className="game-main-content">
        <div className="game-character-info">
          <div className="character-portrait">
            <i className="fa fa-user"></i>
          </div>
          <div className="character-details">
            <h2>{characterName} <span className="character-level">Lv.{level}</span></h2>
            <div className="character-meta">
              <span className="character-class"><i className="fa fa-star"></i> {characterClass}</span>
              <span className="character-status">활성</span>
            </div>
            <button className="sidebar-toggle-button" onClick={toggleSidebar}>
              <i className="fa fa-users"></i>
              {isSidebarOpen ? '회원 목록 닫기' : '회원 목록 보기'}
            </button>
          </div>
        </div>
        
        {/* 환경 정보 표시 */}
        <div className="game-notice">
          {usingProxy ? (
            <span className="env-proxy">프로젝션 환경 (Netlify Functions 사용)</span>
          ) : (
            <span className={environment.isProduction ? "env-production" : "env-development"}>
              {environment.isProduction 
                ? '프로덕션 환경 (Netlify Functions 사용)' 
                : '개발 환경 (로컬 프록시 사용)'}
            </span>
          )}
        </div>
        
        {/* 레이더 차트 영역 */}
        <div className="radar-chart-wrapper">
          {chartData && chartData.datasets && chartData.labels && (
            <Radar data={chartData} options={chartOptions} />
          )}
        </div>
        
        {/* 스탯 정보 영역 */}
        <div className="stat-info-section">
          {Object.entries(statPoints).map(([stat, data]) => (
            <div key={stat} className="stat-item">
              <div className="stat-name">{stat}</div>
              <div className="stat-value">{data.value}</div>
              <div className="stat-ratio">{data.value}/{data.max}</div>
            </div>
          ))}
        </div>
        
        {/* 회원 설명 섹션 */}
        <div className="character-description-section">
          <div className="description-header">
            <h3>회원 설명</h3>
            {!isEditingDesc ? (
              <button className="edit-button" onClick={() => setIsEditingDesc(true)}>
                <i className="edit-icon">✎</i>
                <span>편집</span>
              </button>
            ) : (
              <button className="save-button" onClick={handleSaveDesc}>
                <i className="save-icon">✓</i>
                <span>저장</span>
              </button>
            )}
          </div>
          
          {isEditingDesc ? (
            <textarea 
              className="description-editor"
              value={description}
              onChange={handleDescChange}
              placeholder="회원 설명을 입력하세요..."
            />
          ) : (
            <div className="description-content">
              {description || "회원 설명이 등록되지 않았습니다."}
            </div>
          )}
        </div>
      </div>
      
      {/* 회원 목록 사이드바 (토글 가능한 형식) */}
      <div className={`character-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} ref={sidebarRef}>
        <h3 className="sidebar-title">회원 목록</h3>
        
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="회원 검색..."
            className="search-input"
          />
        </div>
        
        <div className="character-list">
          {filteredCharacters.map((item, index) => (
            <div
              key={item.id}
              className={`character-item ${notionData[selectedIndex]?.id === item.id ? 'active' : ''}`}
              onClick={() => handleCharacterSelect(index)}
            >
              {getCharacterName(item, index)}
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <p>여기에는 뭐가 들어가야 하나 고민중</p>
        </div>
      </div>
    </div>
  );
}

export default GameStyleRadarChart; 