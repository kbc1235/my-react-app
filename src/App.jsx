import { useState, useEffect } from "react";
import NotionDataTable from "./components/NotionDataTable";
import NotionRadarChart from "./components/NotionRadarChart";
import NotionMultiRadarChart from "./components/NotionMultiRadarChart";
import GameStyleRadarChart from "./components/GameStyleRadarChart";
import NotionIntegration from "./components/NotionIntegration";
import Leaderboard from "./components/Leaderboard";
// import CrossfitTest from "./components/CrossfitTest/CrossfitTest";

function App() {
  const [activeTab, setActiveTab] = useState("gameRadar");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "radar":
        return <NotionRadarChart />;
      case "multiRadar":
        return <NotionMultiRadarChart />;
      case "gameRadar":
        return <GameStyleRadarChart />;
      case "gptIntegration":
        return <NotionIntegration />;
      case "table":
        return <NotionDataTable />;
      case "leaderboard":
        return <Leaderboard />;
      case "crossfitTest":
        return <CrossfitTest />;
      default:
        return <GameStyleRadarChart />;
    }
  };

  const handleScroll = () => {
    const header = document.querySelector(".app-header");
    const tabs = document.querySelector(".app-tabs");
    const main = document.querySelector(".app-main");

    if (header && tabs) {
      header.classList.toggle("scrolled", window.scrollY > 0);
      tabs.classList.toggle("scrolled", window.scrollY > 0);

      if (window.scrollY > 0) {
        main.style.paddingTop = "140px";
      } else {
        main.style.paddingTop = "0";
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="app-container">
      {activeTab === "leaderboard" ? (
        <main className="app-main">{renderActiveComponent()}</main>
      ) : (
        <>
          <header className="app-header">
            <h1>Notion API 데이터 뷰어</h1>
            <p>Notion 데이터베이스와 연결된 React 앱입니다.</p>
          </header>

          <div className="app-tabs">
            <button
              className={`tab-button ${
                activeTab === "gameRadar" ? "active" : ""
              }`}
              onClick={() => setActiveTab("gameRadar")}
            >
              게임 스타일 차트
            </button>
            {/* <button
              className={`tab-button ${
                activeTab === "leaderboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("leaderboard")}
            >
              리더보드
            </button> */}
            <button
              className={`tab-button ${
                activeTab === "gptIntegration" ? "active" : ""
              }`}
              onClick={() => setActiveTab("gptIntegration")}
            >
              GPT-Notion 통합
            </button>
          </div>

          <main className="app-main">{renderActiveComponent()}</main>

          <footer className="app-footer">
            <p>React + Vite + Chart.js + Notion API</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
