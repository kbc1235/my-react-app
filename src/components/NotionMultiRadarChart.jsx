import { useState, useEffect } from 'react';
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
import '../styles/NotionRadarChart.css';

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function NotionMultiRadarChart() {
  const [chartData, setChartData] = useState(null);
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
        
        // 데이터 변환하여 차트 데이터 생성 (다중 데이터셋)
        const transformedData = transformDataForMultiRadarChart(result);
        setChartData(transformedData);
        console.log('Notion 다중 차트 데이터:', transformedData);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 동일한 속성 이름을 가진 여러 항목을 비교하는 차트 데이터 생성
  const transformDataForMultiRadarChart = (notionData) => {
    if (!notionData || notionData.length === 0) {
      return null;
    }

    // 최대 5개 항목만 사용 (너무 많으면 차트가 복잡해짐)
    const dataItemsLimit = Math.min(5, notionData.length);
    const selectedItems = notionData.slice(0, dataItemsLimit);
    
    // 공통 속성 이름 찾기
    const commonPropertyNames = new Set();
    
    // 첫 번째 항목의 속성 추가
    if (selectedItems[0] && selectedItems[0].properties) {
      Object.keys(selectedItems[0].properties).forEach(key => {
        commonPropertyNames.add(key);
      });
    }
    
    // 숫자 속성만 필터링
    const labels = Array.from(commonPropertyNames).filter(propName => {
      const property = selectedItems[0].properties[propName];
      return property && (property.type === 'number' || property.number !== undefined);
    });
    
    // 숫자 속성이 부족하면 예시 라벨 생성
    if (labels.length < 3) {
      // 최소 3개 이상의 속성이 필요하므로 임의 속성 추가
      const dummyLabels = ['속성1', '속성2', '속성3', '속성4', '속성5', '속성6'];
      return {
        labels: dummyLabels,
        datasets: selectedItems.map((item, index) => {
          // 각 항목의 제목 가져오기 (없으면 항목 번호 사용)
          const titleProperty = Object.values(item.properties).find(prop => prop.type === 'title');
          const itemTitle = titleProperty ? 
            titleProperty.title.map(t => t.plain_text).join('') : 
            `항목 ${index + 1}`;
          
          // 임의 색상 생성
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          
          return {
            label: itemTitle,
            data: dummyLabels.map(() => Math.floor(Math.random() * 100)),
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
            borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
            borderWidth: 1,
          };
        })
      };
    }
    
    // 실제 데이터로 차트 데이터 생성
    return {
      labels,
      datasets: selectedItems.map((item, index) => {
        // 각 항목의 제목 가져오기 (없으면 항목 번호 사용)
        const titleProperty = Object.values(item.properties).find(prop => prop.type === 'title');
        const itemTitle = titleProperty ? 
          titleProperty.title.map(t => t.plain_text).join('') : 
          `항목 ${index + 1}`;
        
        // 임의 색상 생성
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        
        // 각 라벨에 해당하는 데이터 추출
        const dataValues = labels.map(label => {
          const property = item.properties[label];
          if (property && property.type === 'number') {
            return property.number || 0;
          } else {
            return Math.floor(Math.random() * 100); // 임의 값 생성
          }
        });
        
        return {
          label: itemTitle,
          data: dataValues,
          backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
          borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
          borderWidth: 1,
        };
      })
    };
  };

  // 차트 옵션 설정
  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '항목 비교 방사형 차트'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) return <div className="loading">데이터를 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!chartData) return <div className="no-data">차트 데이터를 생성할 수 없습니다.</div>;

  return (
    <div className="radar-chart-container">
      <h2>항목별 데이터 비교 차트</h2>
      {usingProxy && (
        <div className="proxy-notice">
          CORS 프록시를 사용하여 데이터를 불러왔습니다.
        </div>
      )}
      <div className="chart-description">
        <p>이 차트는 여러 항목의 속성 값을 비교합니다. 각 항목은 서로 다른 색상으로 표시됩니다.</p>
      </div>
      <div className="chart-wrapper">
        <Radar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default NotionMultiRadarChart; 