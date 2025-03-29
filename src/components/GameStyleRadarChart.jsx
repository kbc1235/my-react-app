import { useState, useEffect, useRef } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import {
  fetchNotionDatabase,
  updatePageProperty,
} from "../services/notionService";
import { fetchNotionDatabaseWithProxy } from "../services/notionCorsProxyService";
import { getEnvironment } from "../utils/apiUtils";
import ConfirmModal from "./common/ConfirmModal";

// Chart.js 컴포넌트 등록은 useEffect 내부로 이동

// 게임 관련 스탯 이름 매핑
const STAT_NAMES = {
  title: "회원명",
  number: "수치",
  date: "날짜",
  select: "선택",
  multi_select: "다중선택",
  checkbox: "체크박스",
  Name: "이름",
  Tags: "태그",
  Status: "상태",
  // 게임 스탯 이름
  STR: "힘",
  DEX: "민첩",
  CON: "체력",
  INT: "지능",
  WIS: "지혜",
  CHA: "매력",
  HP: "체력",
  MP: "마력",
  Attack: "공격력",
  Defense: "방어력",
  Speed: "속도",
  Magic: "마법력",
  Luck: "행운",
};

// 스켈레톤 UI 컴포넌트
const SkeletonUI = () => {
  return (
    <div className="skeleton-container">
      <div className="game-character-info skeleton">
        <div className="character-portrait skeleton-avatar">
          <div className="skeleton-pulse"></div>
        </div>
        <div className="character-details">
          <div className="skeleton-title">
            <div className="skeleton-pulse"></div>
          </div>
          <div className="skeleton-meta">
            <div className="skeleton-pulse"></div>
          </div>
          <div className="skeleton-button">
            <div className="skeleton-pulse"></div>
          </div>
        </div>
      </div>

      <div className="radar-chart-wrapper skeleton">
        <div className="skeleton-chart">
          <div className="skeleton-pulse"></div>
        </div>
      </div>

      <div className="stat-info-section skeleton">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="stat-item skeleton">
            <div className="skeleton-stat-name">
              <div className="skeleton-pulse"></div>
            </div>
            <div className="skeleton-stat-value">
              <div className="skeleton-pulse"></div>
            </div>
            <div className="skeleton-stat-ratio">
              <div className="skeleton-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="character-description-section skeleton">
        <div className="description-header">
          <div className="skeleton-desc-title">
            <div className="skeleton-pulse"></div>
          </div>
          <div className="skeleton-desc-button">
            <div className="skeleton-pulse"></div>
          </div>
        </div>
        <div className="skeleton-desc-content">
          <div className="skeleton-pulse"></div>
        </div>
      </div>
    </div>
  );
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
  const [characterName, setCharacterName] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [memberStatus, setMemberStatus] = useState("비활성");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statPoints, setStatPoints] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  // 회원 비교 기능을 위한 상태 추가
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);

  // 모달 관련 상태 추가
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    keepSidebarOpen: true, // 사이드바를 열린 상태로 유지할지 여부
  });

  // 모달 열기 함수
  const openModal = (config) => {
    setModalConfig({
      isOpen: true,
      title: config.title || "알림",
      message: config.message,
      type: config.type || "info",
      onConfirm: config.onConfirm || null,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      keepSidebarOpen:
        config.keepSidebarOpen !== undefined ? config.keepSidebarOpen : true, // 기본값은 사이드바 유지
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // 사이드바 상태는 변경하지 않음
  };

  // Chart.js 컴포넌트 등록
  useEffect(() => {
    // 컴포넌트 마운트 시 Chart.js 등록
    Chart.register(
      RadialLinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip,
      Legend
    );
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
        } catch (apiError) {
          console.error(
            "기본 API 호출 실패, CORS 프록시로 시도합니다:",
            apiError
          );

          // 개발 환경에서만 CORS 프록시 시도
          if (env.isDevelopment) {
            try {
              result = await fetchNotionDatabaseWithProxy();
            } catch (corsError) {
              console.error("CORS 프록시 방식도 실패:", corsError);
              throw new Error("API 연결에 실패했습니다 (CORS 오류)");
            }
          } else {
            // 프로덕션에서는 원래 오류 그대로 발생
            throw apiError;
          }
        }

        // 결과 유효성 검사
        if (!result || !Array.isArray(result) || result.length === 0) {
          console.warn("Notion에서 가져온 데이터가 비어 있습니다:", result);
          setError("Notion에서 데이터를 찾을 수 없습니다.");
          setNotionData([]);
          return;
        }

        // 전체 데이터 저장
        setNotionData(result);

        // 첫 번째 항목 처리
        updateSelectedCharacter(result, 0);
      } catch (err) {
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
        console.error("데이터 로딩 오류:", err);
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
      // 모달이 열려있을 때는 사이드바 닫기 이벤트를 처리하지 않음
      if (modalConfig.isOpen) return;

      // 모달 요소 클릭 시 무시
      const modalElement = document.querySelector(".confirm-modal");
      if (modalElement && modalElement.contains(event.target)) return;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener("mousedown", handleOutsideClick);

    // 클린업 함수
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSidebarOpen, modalConfig.isOpen]);

  // 사이드바 열림/닫힘에 따라 body에 scrollLock 클래스 추가/제거
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("scrollLock");
    } else {
      document.body.classList.remove("scrollLock");
    }

    // 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove("scrollLock");
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
      console.error("유효하지 않은 데이터 또는 인덱스:", {
        dataLength: data?.length,
        index,
      });
      setError("선택한 회원 데이터를 찾을 수 없습니다.");
      return;
    }

    const item = data[index];

    // ID 검증
    if (!item || !item.id) {
      console.error("유효하지 않은 항목 데이터:", item);
      setError("선택한 회원의 데이터가 유효하지 않습니다.");
      return;
    }

    try {
      // 차트 데이터 변환
      const transformedData = transformDataForGameChart(item);

      // 차트 데이터 유효성 검증
      if (
        transformedData &&
        transformedData.chartData &&
        transformedData.chartData.labels &&
        transformedData.chartData.datasets &&
        transformedData.chartData.datasets.length > 0 &&
        transformedData.chartData.datasets[0].data
      ) {
        // 차트 데이터 업데이트
        setChartData(transformedData.chartData);

        // 스탯 포인트 설정
        setStatPoints(transformedData.statPoints || {});
      } else {
        console.error("유효하지 않은 차트 데이터:", transformedData);
        setError("차트 데이터 생성에 실패했습니다.");
        return;
      }

      // 회원 이름 추출 시도
      let name = `회원 #${index + 1}`;
      const titleProp = Object.values(item.properties).find(
        (prop) => prop.type === "title"
      );
      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        name = titleProp.title.map((t) => t.plain_text).join("");
        name = name.trim() || name; // 빈 문자열이면 기본값 유지
      }
      setCharacterName(name);

      // 회원 상태(member) 추출 시도
      let status = "비활성";
      const memberProp = Object.entries(item.properties).find(
        ([key]) => key.toLowerCase() === "membership"
      );

      if (memberProp && memberProp[1].formula && memberProp[1].formula.string) {
        status = memberProp[1].formula.string;
      }
      setMemberStatus(status);

      // 설명(dec) 추출 시도
      let desc = "";
      const decProp = Object.entries(item.properties).find(
        ([key]) => key.toLowerCase() === "dec"
      );

      if (decProp && decProp[1].rich_text && decProp[1].rich_text.length > 0) {
        desc = decProp[1].rich_text.map((t) => t.plain_text).join("");
      } else if (
        decProp &&
        decProp[1].type === "rich_text" &&
        decProp[1].rich_text
      ) {
        desc = decProp[1].rich_text.map((t) => t.plain_text).join("");
      }

      setDescription(desc);
      setIsEditingDesc(false);

      // 레벨 랜덤 설정
      setLevel(Math.floor(Math.random() * 50) + 1);

      // 회원 유형형 설정
      const classes = [
        "직장인 과부화형",
        " 육아맘 리커버리형",
        "바디프로젝트 형",
        "자기계발형",
        "공감커뮤니티형",
        "힐링 중심형",
      ];
      setCharacterClass(classes[Math.floor(Math.random() * classes.length)]);

      // 비교 모드가 활성화된 경우에만 selectedCharacters 배열 업데이트
      if (isCompareEnabled) {
        setSelectedCharacters((prev) => {
          // 이미 선택된 회원인지 확인
          const isSelected = prev.some((char) => char.id === item.id);

          // 이미 선택되어 있다면 기존 목록 유지
          if (isSelected) {
            return prev;
          }

          // 최대 4명까지만 선택 가능하도록 제한
          if (prev.length >= 4) {
            // 가장 오래된 항목(첫 번째 항목) 제거하고 새 항목 추가
            const newSelection = [
              ...prev.slice(1),
              {
                id: item.id,
                name: name,
                index: index,
                data: transformedData.chartData.datasets[0].data,
                labels: transformedData.chartData.labels,
              },
            ];

            // 4명 초과 시 안내 메시지
            openModal({
              title: "선택 제한",
              message:
                "최대 4명까지만 비교할 수 있어 가장 먼저 선택한 회원이 제외되었습니다.",
              type: "info",
            });

            return newSelection;
          }

          // 새 항목 추가
          return [
            ...prev,
            {
              id: item.id,
              name: name,
              index: index,
              data: transformedData.chartData.datasets[0].data,
              labels: transformedData.chartData.labels,
            },
          ];
        });
      } else {
        // 비교 모드가 비활성화된 경우, 현재 선택된 회원만 유지
        setSelectedCharacters([
          {
            id: item.id,
            name: name,
            index: index,
            data: transformedData.chartData.datasets[0].data,
            labels: transformedData.chartData.labels,
          },
        ]);
      }
    } catch (error) {
      console.error("회원 데이터 업데이트 중 오류 발생:", error);
      setError(`데이터 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 회원 목록에서 이름 표시용 함수
  const getCharacterName = (item, index) => {
    const titleProp = Object.values(item.properties).find(
      (prop) => prop.type === "title"
    );
    if (titleProp && titleProp.title.length > 0) {
      return titleProp.title.map((t) => t.plain_text).join("");
    }
    return index !== undefined ? `회원 #${index + 1}` : "이름 없음";
  };

  // 검색어를 기준으로 필터링된 회원 목록
  const filteredCharacters = notionData.filter((item) => {
    const characterName = getCharacterName(item);
    return characterName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 회원 선택 핸들러
  const handleCharacterSelect = (index) => {
    // 필터링된 목록에서 실제 원본 데이터의 인덱스를 찾음
    const selectedItem = filteredCharacters[index];
    const originalIndex = notionData.findIndex(
      (item) => item.id === selectedItem.id
    );

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
        console.log("설명 저장 시작:", {
          pageId,
          description,
        });

        // Notion API를 통해 설명 업데이트
        const result = await updatePageProperty(pageId, "dec", description);
        console.log("설명 저장 완료:", result);

        // 성공 알림 등 추가 가능
      }
    } catch (error) {
      console.error("설명 저장 중 오류:", error);
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
    let maxValue = 0; // 최대값 추적

    // 속성을 반복하여 숫자 값만 추출
    Object.entries(item.properties).forEach(([key, property]) => {
      // 숫자 타입 속성 또는 변환 가능한 속성만 추출
      if (property.type === "number" || property.number !== undefined) {
        const label = translateStatName(key);
        labels.push(label);
        const value = property.number || 0;
        dataValues.push(value);

        // 최대값 추적
        if (value > maxValue) maxValue = value;

        // 스탯 포인트 저장
        statPoints[label] = {
          value,
          max: Math.max(100, maxValue), // 최대값이 100 이상이면 그 값을 사용
        };
      }
    });

    // 데이터가 부족한 경우 게임 스탯 추가
    if (labels.length < 6) {
      const gameStats = ["힘", "민첩", "체력", "지능", "지혜", "매력"];
      const existingCount = labels.length;

      for (let i = 0; i < Math.min(6 - existingCount, gameStats.length); i++) {
        const label = gameStats[i];
        labels.push(label);
        const value = Math.floor(Math.random() * 70) + 30; // 30-100 사이의 랜덤 값
        dataValues.push(value);

        // 최대값 추적
        if (value > maxValue) maxValue = value;

        // 스탯 포인트 저장
        statPoints[label] = {
          value,
          max: Math.max(100, maxValue), // 최대값이 100 이상이면 그 값을 사용
        };
      }
    }

    // 스케일링 제거, 원본 데이터 값 사용
    return {
      chartData: {
        labels,
        datasets: [
          {
            label: "회원 스탯",
            data: dataValues, // 원본 데이터 값 사용
            backgroundColor: "rgba(75, 217, 251, 0.5)",
            borderColor: "rgba(75, 217, 251, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(255, 206, 86, 1)",
            pointBorderColor: "#000",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255, 206, 86, 1)",
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
          },
        ],
      },
      statPoints,
    };
  };

  // 차트 옵션 설정
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: "rgba(75, 217, 251, 0.2)",
        },
        grid: {
          color: "rgba(75, 217, 251, 0.2)",
          circular: true,
        },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          backdropColor: "transparent",
          color: "rgba(255, 255, 255, 0.8)",
          z: 1,
          stepSize: 20,
          font: {
            size: 10,
          },
        },
        pointLabels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: '"Noto Sans KR", sans-serif',
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: '"Noto Sans KR", sans-serif',
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: '"Noto Sans KR", sans-serif',
          size: 12,
        },
        bodyFont: {
          family: '"Noto Sans KR", sans-serif',
          size: 12,
        },
      },
    },
    elements: {
      line: {
        tension: 0.1,
        borderWidth: 2,
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
      },
    },
  };

  // 모바일 환경에서 차트 옵션 조정
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // 모바일 환경에서 차트 옵션 수정
    chartOptions.scales.r.pointLabels.font.size = 10;
    chartOptions.scales.r.ticks.display = false;
    chartOptions.scales.r.ticks.font.size = 8;
    chartOptions.plugins.legend.labels.font.size = 12;
    chartOptions.plugins.legend.labels.boxWidth = 10;
    chartOptions.plugins.legend.labels.padding = 5;
    chartOptions.elements.point.radius = 3;
    chartOptions.elements.point.hoverRadius = 5;
    chartOptions.elements.line.borderWidth = 1.5;
  }

  // 비교 모드 차트 옵션
  const compareChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        bottom: 25,
        left: 5,
        right: 5,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: "rgba(75, 217, 251, 0.1)",
        },
        grid: {
          color: "rgba(75, 217, 251, 0.1)",
          circular: true,
        },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          backdropColor: "transparent",
          display: false,
          stepSize: 20,
          z: 1,
          font: {
            size: 10,
          },
        },
        pointLabels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 11,
            family: '"Noto Sans KR", sans-serif',
          },
          padding: 5,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
            family: '"Noto Sans KR", sans-serif',
          },
          filter: () => {
            return true;
          },
          generateLabels: (chart) => {
            const defaultLabels =
              Chart.defaults.plugins.legend.labels.generateLabels(chart);

            return defaultLabels.map((label) => {
              if (label.text.includes("(현재)")) {
                return {
                  ...label,
                  fontStyle: "bold",
                  lineWidth: 3,
                };
              }
              return label;
            });
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: '"Noto Sans KR", sans-serif',
          size: 12,
        },
        bodyFont: {
          family: '"Noto Sans KR", sans-serif',
          size: 12,
        },
        callbacks: {
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
          label: (context) => {
            const label = context.dataset.label;
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.2,
        borderWidth: 2,
      },
      point: {
        hitRadius: 10,
        hoverRadius: 7,
      },
    },
  };

  // 모바일 환경에서 비교 차트 옵션 조정
  if (isMobile) {
    // 모바일 환경에서 비교 차트 옵션 수정
    compareChartOptions.scales.r.pointLabels.font.size = 9;
    compareChartOptions.scales.r.pointLabels.padding = 2;
    compareChartOptions.plugins.legend.labels.boxWidth = 8;
    compareChartOptions.plugins.legend.labels.padding = 5;
    compareChartOptions.plugins.legend.labels.font.size = 9;
    compareChartOptions.plugins.tooltip.titleFont.size = 10;
    compareChartOptions.plugins.tooltip.bodyFont.size = 10;
    compareChartOptions.elements.point.radius = 3;
    compareChartOptions.elements.point.hoverRadius = 5;
    compareChartOptions.elements.line.borderWidth = 1.5;
    compareChartOptions.layout.padding = {
      top: 5,
      bottom: 15,
      left: 5,
      right: 5,
    };
  }

  // 비교 모드 활성화 상태 토글 함수
  const toggleCompareEnabled = () => {
    const newState = !isCompareEnabled;
    setIsCompareEnabled(newState);

    if (newState) {
      // 비교 모드 활성화 시
      const currentItem = notionData[selectedIndex];
      if (currentItem) {
        const name = getCharacterName(currentItem, selectedIndex);
        const transformedData = transformDataForGameChart(currentItem);

        // 현재 회원이 이미 선택되어 있는지 확인
        const isCurrentSelected = selectedCharacters.some(
          (char) => char.id === currentItem.id
        );

        if (isCurrentSelected) {
          // 이미 선택되어 있다면 아무것도 하지 않음
          console.log("현재 회원이 이미 선택되어 있음:", name);
        } else {
          // 현재 회원 데이터 준비
          const currentCharData = {
            id: currentItem.id,
            name: name,
            index: selectedIndex,
            data: transformedData.chartData.datasets[0].data,
            labels: transformedData.chartData.labels,
          };

          // 현재 선택 목록에 추가 (기존 배열은 초기화하고 현재 회원만 포함)
          setSelectedCharacters([currentCharData]);
        }
      }
    } else {
      // 비교 모드 비활성화 시
      setIsCompareMode(false); // 비교 모드 보기 끄기
      // 현재 선택된 회원만 유지하고 나머지는 초기화
      const currentCharacter = selectedCharacters.find(
        (char) => char.id === notionData[selectedIndex]?.id
      );
      setSelectedCharacters(currentCharacter ? [currentCharacter] : []);
    }
  };

  // 회원 체크박스 토글 처리 함수
  const handleToggleCharacterSelect = (item, index) => {
    // 비교 모드가 활성화되지 않았다면 아무것도 하지 않음
    if (!isCompareEnabled) return;

    const originalIndex = notionData.findIndex(
      (dataItem) => dataItem.id === item.id
    );
    const characterName = getCharacterName(item, index);

    // 현재 표시 중인 회원은 체크 해제 불가능 - 항상 선택 상태로 유지
    if (item.id === notionData[selectedIndex]?.id) {
      const isSelected = selectedCharacters.some((char) => char.id === item.id);

      // 현재 회원이 선택되어 있지 않은 경우 (비정상 상태), 강제로 선택에 추가
      if (!isSelected) {
        const transformedData = transformDataForGameChart(
          notionData[originalIndex]
        );
        setSelectedCharacters((prev) => [
          ...prev,
          {
            id: item.id,
            name: characterName,
            index: originalIndex,
            data: transformedData.chartData.datasets[0].data,
            labels: transformedData.chartData.labels,
          },
        ]);
      } else {
        // 현재 선택된 경우, 체크 해제 시도 시 경고 메시지
        openModal({
          title: "제거 불가",
          message: "현재 보고 있는 회원은 비교 대상에서 제외할 수 없습니다.",
          type: "warning",
        });
      }
      return;
    }

    // 다른 회원들 토글 처리
    setSelectedCharacters((prev) => {
      // 이미 선택된 회원인지 확인
      const isSelected = prev.some((char) => char.id === item.id);

      if (isSelected) {
        // 선택 해제
        return prev.filter((char) => char.id !== item.id);
      } else {
        // 최대 4명까지만 선택 가능
        if (prev.length >= 4) {
          // 경고 모달 표시
          openModal({
            title: "선택 제한",
            message: "최대 4명까지만 비교할 수 있습니다.",
            type: "warning",
          });
          return prev;
        }

        // 새로운 회원 선택시 데이터 변환
        const transformedData = transformDataForGameChart(
          notionData[originalIndex]
        );

        // 선택 추가
        return [
          ...prev,
          {
            id: item.id,
            name: characterName,
            index: originalIndex,
            data: transformedData.chartData.datasets[0].data,
            labels: transformedData.chartData.labels,
          },
        ];
      }
    });
  };

  // 비교 모드 토글 함수
  const toggleCompareMode = () => {
    if (selectedCharacters.length < 2) {
      // alert 대신 모달 사용
      openModal({
        title: "회원 선택 필요",
        message: "비교하려면 최소 2명 이상 선택해야 합니다.",
        type: "info",
      });
      return;
    }

    setIsCompareMode(!isCompareMode);
  };

  // 비교 차트 데이터 생성 함수
  const createCompareChartData = () => {
    if (selectedCharacters.length < 2) return null;

    // 모든 선택된 회원의 레이블을 합치고 중복 제거
    const allLabels = [
      ...new Set(selectedCharacters.flatMap((char) => char.labels)),
    ];

    // 데이터의 최대값 찾기 (모든 회원 데이터 중)
    let maxValue = 0;
    selectedCharacters.forEach((char) => {
      const charMax = Math.max(...char.data);
      if (charMax > maxValue) maxValue = charMax;
    });

    // 각 회원별 데이터셋 생성
    const colors = [
      { bg: "rgba(255, 206, 86, 0.5)", border: "rgba(255, 206, 86, 1)" },
      { bg: "rgba(123, 239, 178, 0.5)", border: "rgba(123, 239, 178, 1)" },
      { bg: "rgba(255, 99, 132, 0.5)", border: "rgba(255, 99, 132, 1)" },
      { bg: "rgba(75, 217, 251, 0.5)", border: "rgba(75, 217, 251, 1)" }, // 현재 회원은 항상 이 색상 사용
    ];

    // 현재 선택된 회원을 가장 마지막에 렌더링하도록 데이터 재정렬
    const reorderedCharacters = [...selectedCharacters].sort((a, b) => {
      // 현재 보고 있는 회원은 항상 마지막으로
      if (a.id === notionData[selectedIndex]?.id) return 1;
      if (b.id === notionData[selectedIndex]?.id) return -1;
      return 0;
    });

    const datasets = reorderedCharacters.map((char, index) => {
      // 현재 보고 있는 회원인지 확인
      const isCurrentCharacter = char.id === notionData[selectedIndex]?.id;
      const colorIndex = isCurrentCharacter ? 3 : index % 3; // 현재 회원은 항상 마지막 색상 사용

      // 모든 레이블에 맞게 데이터 재구성
      const data = allLabels.map((label) => {
        const labelIndex = char.labels.indexOf(label);
        // 데이터가 있으면 해당 값 사용, 없으면 0
        return labelIndex >= 0 ? char.data[labelIndex] : 0;
      });

      return {
        label: isCurrentCharacter ? `${char.name} (현재)` : char.name,
        data: data,
        backgroundColor: colors[colorIndex].bg,
        borderColor: colors[colorIndex].border,
        borderWidth: isCurrentCharacter ? 3 : 2,
        pointBackgroundColor: colors[colorIndex].border,
        pointBorderColor: "#000",
        pointRadius: isCurrentCharacter ? 5 : 4,
        pointHoverRadius: isCurrentCharacter ? 8 : 6,
        order: isCurrentCharacter ? 1 : 2,
        fill: true,
      };
    });

    return {
      labels: allLabels,
      datasets,
    };
  };

  // 로딩 및 에러 화면
  if (loading)
    return (
      <div className="game-chart-container">
        <div className="game-main-content">
          <div className="game-loading">
            <div className="loading-icon">
              <i className="fa fa-spinner fa-pulse fa-3x"></i>
            </div>
            <p>데이터를 불러오는 중입니다...</p>
            <p className="loading-subtext">잠시만 기다려주세요.</p>
            <SkeletonUI />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="game-chart-container">
        <div className="game-main-content">
          <div className="game-error">
            <div className="error-icon">
              <i className="fa fa-exclamation-triangle fa-3x"></i>
            </div>
            <p>데이터를 불러오는데 실패했습니다</p>
            <p className="error-message">{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              <i className="fa fa-refresh"></i> 다시 시도
            </button>
            <SkeletonUI />
          </div>
        </div>
      </div>
    );

  if (!chartData)
    return (
      <div className="game-chart-container">
        <div className="game-main-content">
          <div className="game-no-data">
            <div className="no-data-icon">
              <i className="fa fa-search fa-3x"></i>
            </div>
            <p>회원 정보를 찾을 수 없습니다</p>
            <p className="no-data-subtext">
              다른 회원을 선택하거나 검색해보세요.
            </p>
            <SkeletonUI />
          </div>
        </div>
      </div>
    );

  return (
    <div className="game-chart-container">
      {/* 메인 컨텐츠 영역 */}
      <div className={`game-main-content ${isMobile ? "mobile-view" : ""}`}>
        <div className="game-character-info">
          <div className="character-portrait">
            <i className="fa fa-user"></i>
          </div>
          <div className="character-details">
            <h2>
              {characterName}{" "}
              <span className="character-level">Lv.{level}</span>
            </h2>
            <div className="character-meta">
              <span className="character-class">
                <i className="fa fa-star"></i> {characterClass}
              </span>
              <span
                className={`character-status ${
                  memberStatus === "member" ? "active" : ""
                }`}
              >
                {memberStatus === "member" ? "활성" : "비활성"}
              </span>
            </div>
            <button className="sidebar-toggle-button" onClick={toggleSidebar}>
              <i className="fa fa-users"></i>
              {isSidebarOpen ? "회원 목록 닫기" : "회원 목록 보기"}
            </button>
          </div>
        </div>

        {/* 레이더 차트 영역 */}
        <div className="radar-chart-wrapper">
          {isCompareMode ? (
            // 비교 모드 차트
            <div className="compare-view">
              <div className="compare-view-header">
                <h3 className="compare-title">회원 비교 차트</h3>
                <div className="selected-characters-list">
                  {selectedCharacters.map((char, index) => (
                    <div
                      key={char.id}
                      className={`selected-character-badge ${
                        char.id === notionData[selectedIndex]?.id
                          ? "current-character"
                          : ""
                      }`}
                      style={{
                        borderColor: [
                          "rgba(75, 217, 251, 1)",
                          "rgba(255, 206, 86, 1)",
                          "rgba(123, 239, 178, 1)",
                          "rgba(255, 99, 132, 1)",
                        ][index % 4],
                      }}
                    >
                      {char.name}
                      {char.id === notionData[selectedIndex]?.id && (
                        <span
                          className="current-indicator"
                          title="현재 보고 있는 회원"
                        >
                          <i className="fa fa-eye"></i>
                        </span>
                      )}
                      <button
                        className="remove-character"
                        onClick={() => {
                          if (char.id === notionData[selectedIndex]?.id) {
                            openModal({
                              title: "제거 불가",
                              message:
                                "현재 보고 있는 회원은 비교 대상에서 제외할 수 없습니다.",
                              type: "warning",
                            });
                            return;
                          }

                          setSelectedCharacters((prev) =>
                            prev.filter((c) => c.id !== char.id)
                          );
                          if (selectedCharacters.length <= 2)
                            setIsCompareMode(false);
                        }}
                        disabled={char.id === notionData[selectedIndex]?.id}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="compare-chart-container">
                {createCompareChartData() && (
                  <Radar
                    data={createCompareChartData()}
                    options={compareChartOptions}
                  />
                )}
              </div>
            </div>
          ) : (
            // 기존 단일 차트
            chartData &&
            chartData.datasets &&
            chartData.labels && (
              <Radar data={chartData} options={chartOptions} />
            )
          )}
        </div>

        {/* 스탯 정보 영역 */}
        <div className="stat-info-section">
          {Object.entries(statPoints).map(([stat, data]) => (
            <div key={stat} className="stat-item">
              <div className="stat-name">{stat}</div>
              <div className="stat-value">{data.value}</div>
              <div className="stat-ratio">
                {data.value}/{data.max}
              </div>
            </div>
          ))}
        </div>

        {/* 회원 설명 섹션 */}
        <div className="character-description-section">
          <div className="description-header">
            <h3>회원 설명</h3>
            {!isEditingDesc ? (
              <button
                className="edit-button"
                onClick={() => setIsEditingDesc(true)}
              >
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
      <div
        className={`character-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        ref={sidebarRef}
      >
        <h3 className="sidebar-title">회원 목록</h3>

        {/* 비교 모드 스위치 추가 */}
        <div className="compare-switch-container">
          <span className="compare-switch-label">비교하기</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isCompareEnabled}
              onChange={toggleCompareEnabled}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="회원 검색..."
            className="search-input"
          />
        </div>

        <div className={`character-list ${isCompareEnabled ? "open" : ""}`}>
          {filteredCharacters.map((item, index) => (
            <div
              key={item.id}
              className={`character-item ${
                notionData[selectedIndex]?.id === item.id ? "active" : ""
              } ${
                selectedCharacters.some((char) => char.id === item.id)
                  ? "selected-for-compare"
                  : ""
              }`}
            >
              <div
                className="character-item-content"
                onClick={() => handleCharacterSelect(index)}
              >
                {getCharacterName(item, index)}
              </div>
              {isCompareEnabled && (
                <div
                  className="character-select-checkbox"
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 중지
                  }}
                >
                  <input
                    type="checkbox"
                    id={`character-checkbox-${item.id}`}
                    checked={selectedCharacters.some(
                      (char) => char.id === item.id
                    )}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleCharacterSelect(item, index);
                    }}
                    title="비교 대상으로 선택"
                    disabled={item.id === notionData[selectedIndex]?.id}
                  />
                  <label
                    htmlFor={`character-checkbox-${item.id}`}
                    className={`custom-checkbox ${
                      item.id === notionData[selectedIndex]?.id ? "locked" : ""
                    }`}
                    title={
                      item.id === notionData[selectedIndex]?.id
                        ? "현재 보고 있는 회원은 항상 비교 대상에 포함됩니다"
                        : "비교 대상으로 선택"
                    }
                    onClick={(e) => e.stopPropagation()}
                  ></label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {isCompareEnabled && (
            <div className="compare-controls">
              <div className="selected-count">
                {selectedCharacters.length > 0
                  ? `${selectedCharacters.length}명 선택됨 (최대 4명)`
                  : "비교할 회원을 선택하세요"}
              </div>
              <button
                className={`compare-toggle-button ${
                  isCompareMode ? "active" : ""
                }`}
                onClick={toggleCompareMode}
                disabled={selectedCharacters.length < 2}
              >
                {isCompareMode ? "비교 모드 종료" : "비교 시작"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 컨펌 모달 컴포넌트 추가 */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </div>
  );
}

export default GameStyleRadarChart;
