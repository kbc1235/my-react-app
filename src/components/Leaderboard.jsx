import { useState } from 'react';

// 더미 데이터 - 실제로는 API 호출 등으로 대체
const athletesData = [
  {
    id: 1,
    rank: '2번째',
    name: 'YOUNGWOO KIM',
    country: 'kr',
    points: 125963,
    image: '/placeholder-avatar.png'
  },
  {
    id: 2,
    rank: '4번째',
    name: 'YONGMIN CHO',
    country: 'kr',
    points: 142679,
    image: '/placeholder-avatar.png'
  },
  {
    id: 3,
    rank: '5번째',
    name: 'CHANSEOK PARK',
    country: 'kr',
    points: 142703,
    image: '/placeholder-avatar.png'
  },
  {
    id: 4,
    rank: '6번째',
    name: 'HEESUN RYU',
    country: 'kr',
    points: 389964,
    image: '/placeholder-avatar.png'
  },
  {
    id: 5,
    rank: '6번째',
    name: 'KANGHI',
    country: 'kr',
    points: 389964,
    image: '/placeholder-avatar.png'
  }
];

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [activeFilter, setActiveFilter] = useState('individual');

  return (
    <div className="leaderboard-container">
      {/* 메인 헤더 */}
      <header className="main-header">
        <button className="back-button">
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="logo">
          <img src="/images/open-logo.svg" alt="The Open Logo" />
        </div>
        
        <div className="title">
          THE OPEN <i className="fas fa-chevron-down dropdown-arrow"></i>
        </div>
        
        <button className="search-button">
          <i className="fas fa-search"></i>
        </button>
      </header>
      
      {/* 탭 네비게이션 */}
      <nav className="tabs-navigation">
        <div 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </div>
        <div 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </div>
        <div 
          className={`tab ${activeTab === 'watch' ? 'active' : ''}`}
          onClick={() => setActiveTab('watch')}
        >
          Watch
        </div>
      </nav>
      
      {/* 필터 옵션 */}
      <div className="filter-options">
        <button 
          className={`filter-button ${activeFilter === 'rx' ? 'active' : ''}`}
          onClick={() => setActiveFilter('rx')}
        >
          RX'D
        </button>
        <button 
          className={`filter-button ${activeFilter === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveFilter('individual')}
        >
          Individual
        </button>
        <button 
          className={`filter-button ${activeFilter === 'men' ? 'active' : ''}`}
          onClick={() => setActiveFilter('men')}
        >
          Men
        </button>
        
        <button className="filter-menu">
          <i className="fas fa-bars"></i>
        </button>
      </div>
      
      {/* 리더보드 헤더 */}
      <div className="leaderboard-header">
        <div className="athlete-column">Athlete</div>
        <div className="points-column">Points</div>
      </div>
      
      {/* 리더보드 선수 목록 */}
      <div className="athletes-list">
        {athletesData.map((athlete) => (
          <div key={athlete.id} className="athlete-row">
            <div className="rank">{athlete.rank}</div>
            <div className="athlete-info">
              <div className="athlete-image">
                <div style={{width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color: '#fff', fontSize: '12px'}}>{athlete.name.charAt(0)}</span>
                </div>
              </div>
              <div className="athlete-details">
                <div className="athlete-name">
                  {athlete.name}
                </div>
                <div>
                  <img 
                    className="flag" 
                    src={`/images/flags/${athlete.country}.svg`} 
                    alt={athlete.country} 
                  />
                </div>
              </div>
            </div>
            <div className="points">{athlete.points.toLocaleString()}</div>
            <button className="expand-button">
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        ))}
      </div>
      
      {/* 하단 탭 네비게이션 */}
      <nav className="bottom-navigation">
        <div className="nav-item active">
          <i className="fas fa-home nav-icon"></i>
          <span className="nav-label">Home</span>
        </div>
        <div className="nav-item">
          <i className="fas fa-dumbbell nav-icon"></i>
          <span className="nav-label">Workout</span>
        </div>
        <div className="nav-item">
          <i className="fas fa-chart-line nav-icon"></i>
          <span className="nav-label">Progress</span>
        </div>
        <div className="nav-item">
          <i className="fas fa-trophy nav-icon"></i>
          <span className="nav-label">Competitions</span>
        </div>
        <div className="nav-item">
          <i className="fas fa-users nav-icon"></i>
          <span className="nav-label">Athletes</span>
        </div>
      </nav>
    </div>
  );
}

export default Leaderboard; 