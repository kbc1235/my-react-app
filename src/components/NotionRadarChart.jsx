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

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function NotionRadarChart() {
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
        
        // 데이터 변환하여 차트 데이터 생성
        const transformedData = transformDataForRadarChart(result);
        setChartData(transformedData);
        console.log('Notion 차트 데이터:', transformedData);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Notion 데이터를 방사형 차트 데이터로 변환하는 함수
  const transformDataForRadarChart = (notionData) => {
    if (!notionData || notionData.length === 0) {
      return null;
    }

    // 데이터의 특성에 따라 변환 로직을 조정해야 할 수 있습니다.
    // 이 예시에서는 첫 번째 항목의 숫자 속성을 사용합니다.
    const firstItem = notionData[0];
    const labels = [];
    const dataValues = [];
    const backgroundColors = [];

    // 속성을 반복하여 숫자 값만 추출
    Object.entries(firstItem.properties).forEach(([key, property]) => {
      // 숫자 타입 속성 또는 변환 가능한 속성만 추출
      if (property.type === 'number' || property.number !== undefined) {
        labels.push(key);
        dataValues.push(property.number || 0);
        // 무작위 색상 생성
        backgroundColors.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`);
      }
    });

    // 숫자 데이터가 없는 경우 예시 데이터를 생성합니다
    if (labels.length === 0) {
      // 모든 항목에서 속성 이름 추출
      const allPropertyNames = new Set();
      notionData.forEach(item => {
        Object.keys(item.properties).forEach(key => {
          allPropertyNames.add(key);
        });
      });

      // 최대 6개의 속성 사용
      const selectedPropertyNames = Array.from(allPropertyNames).slice(0, 6);
      
      // 예시 값 생성
      selectedPropertyNames.forEach(name => {
        labels.push(name);
        dataValues.push(Math.floor(Math.random() * 100)); // 0-100 사이 무작위 값
        backgroundColors.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`);
      });
    }

    return {
      labels,
      datasets: [
        {
          label: '데이터 포인트',
          data: dataValues,
          backgroundColor: 'rgba(75, 107, 251, 0.2)',
          borderColor: 'rgba(75, 107, 251, 1)',
          borderWidth: 1,
        },
      ],
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
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Notion 데이터 방사형 차트'
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
      <h2>Notion 데이터 방사형 차트</h2>
      {usingProxy && (
        <div className="proxy-notice">
          CORS 프록시를 사용하여 데이터를 불러왔습니다.
        </div>
      )}
      <div className="chart-wrapper">
        <Radar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default NotionRadarChart; 