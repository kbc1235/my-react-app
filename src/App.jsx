import { useState } from 'react';
import NotionDataTable from './components/NotionDataTable';
import NotionRadarChart from './components/NotionRadarChart';
import NotionMultiRadarChart from './components/NotionMultiRadarChart';
import GameStyleRadarChart from './components/GameStyleRadarChart';
import NotionIntegration from './components/NotionIntegration';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('gameRadar');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'radar':
        return <NotionRadarChart />;
      case 'multiRadar':
        return <NotionMultiRadarChart />;
      case 'gameRadar':
        return <GameStyleRadarChart />;
      case 'gptIntegration':
        return <NotionIntegration />;
      case 'table':
      default:
        return <NotionDataTable />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Notion API 데이터 뷰어</h1>
        <p>Notion 데이터베이스와 연결된 React 앱입니다.</p>
      </header>
      
      <div className="app-tabs">
        {/* <button 
          className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          데이터 테이블
        </button>
        <button 
          className={`tab-button ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          방사형 차트
        </button>
        <button 
          className={`tab-button ${activeTab === 'multiRadar' ? 'active' : ''}`}
          onClick={() => setActiveTab('multiRadar')}
        >
          다중 방사형 차트
        </button> */}
        <button 
          className={`tab-button ${activeTab === 'gameRadar' ? 'active' : ''}`}
          onClick={() => setActiveTab('gameRadar')}
        >
          게임 스타일 차트
        </button>
        <button 
          className={`tab-button ${activeTab === 'gptIntegration' ? 'active' : ''}`}
          onClick={() => setActiveTab('gptIntegration')}
        >
          GPT-Notion 통합
        </button>
      </div>
      
      <main className="app-main">
        {renderActiveComponent()}
      </main>
      
      <footer className="app-footer">
        <p>React + Vite + Chart.js + Notion API</p>
      </footer>
    </div>
  );
}

export default App;
